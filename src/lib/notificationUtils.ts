import { addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Department, Priority, GrievanceStatus, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';

/**
 * Creates a single notification for a specific user.
 */
export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
    relatedGrievanceId?: string,
    relatedGrievanceTitle?: string
) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: serverTimestamp(),
            ...(relatedGrievanceId && { relatedGrievanceId }),
            ...(relatedGrievanceTitle && { relatedGrievanceTitle }),
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

/**
 * Broadcasts a notification to all Admin users.
 * Returns the list of user IDs notified.
 */
const notifyAdmins = async (batch: any, title: string, message: string, grievanceId: string, grievanceTitle: string) => {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const snap = await getDocs(q);
    const userIds: string[] = [];

    snap.forEach(userDoc => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
            userId: userDoc.data().uid,
            title,
            message,
            type: 'info',
            read: false,
            createdAt: serverTimestamp(),
            relatedGrievanceId: grievanceId,
            relatedGrievanceTitle: grievanceTitle,
        });
        userIds.push(userDoc.data().uid);
    });
    return userIds;
};

/**
 * Broadcasts a notification to Department Officials matching the grievance departments.
 */
const notifyDepartments = async (batch: any, departments: Department[], title: string, message: string, grievanceId: string, grievanceTitle: string) => {
    // Firestore array-contains-any allows up to 10 items, which fits our departments list
    const q = query(collection(db, 'users'), where('role', '==', 'department'), where('department', 'in', departments));

    // Note: 'in' query works for exact match on single field. 
    // If user.department is a single string and grievance has multiple departments, we want users where user.department is IN grievance.departments

    const snap = await getDocs(q);
    const userIds: string[] = [];

    snap.forEach(userDoc => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
            userId: userDoc.data().uid,
            title,
            message,
            type: 'warning',
            read: false,
            createdAt: serverTimestamp(),
            relatedGrievanceId: grievanceId,
            relatedGrievanceTitle: grievanceTitle,
        });
        userIds.push(userDoc.data().uid);
    });
    return userIds;
};

/**
 * Main function to notify Admins and Dept Officials about a new grievance.
 */
export const notifyGrievanceSubmission = async (
    grievanceId: string,
    grievanceTitle: string,
    departments: Department[],
    submittedByName: string
) => {
    try {
        const batch = writeBatch(db);

        const message = `New Grievance submitted by ${submittedByName}: "${grievanceTitle}"`;

        await notifyAdmins(batch, 'New Grievance Alert', message, grievanceId, grievanceTitle);

        if (departments.length > 0) {
            await notifyDepartments(batch, departments, 'New Departmental Grievance', message, grievanceId, grievanceTitle);
        }

        await batch.commit();
        console.log('Notifications broadcasted for grievance:', grievanceId);
    } catch (error) {
        console.error('Error broadcasting submission notifications:', error);
    }
};

/**
 * Notify the citizen about status or priority updates.
 */
export const notifyStatusUpdate = async (
    userId: string,
    grievanceId: string,
    grievanceTitle: string,
    newStatus?: GrievanceStatus,
    newPriority?: Priority
) => {
    let messageParts: string[] = [];
    if (newStatus) messageParts.push(`Status changed to ${STATUS_CONFIG[newStatus].label}`);
    if (newPriority) messageParts.push(`Priority changed to ${PRIORITY_CONFIG[newPriority].label}`);

    if (messageParts.length === 0) return;

    const message = `Update on "${grievanceTitle}": ${messageParts.join(' and ')}.`;

    // We act as 'system' here, sending to the user
    const type = newStatus === 'resolved' ? 'success' : 'info';

    await createNotification(userId, 'Grievance Update', message, type, grievanceId, grievanceTitle);
};
