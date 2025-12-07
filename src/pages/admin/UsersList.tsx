import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Grievance } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all users
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const userList: User[] = [];
                usersSnapshot.forEach((doc) => {
                    userList.push(doc.data() as User);
                });

                // Fetch all grievances to calculate counts
                // Note: In a production app with thousands of records, we would use aggregation queries or cloud functions.
                // For this scale, client-side filtering is acceptable.
                const grievancesSnapshot = await getDocs(collection(db, 'grievances'));
                const grievanceList: Grievance[] = [];
                grievancesSnapshot.forEach((doc) => {
                    grievanceList.push(doc.data() as Grievance);
                });

                setUsers(userList);
                setGrievances(grievanceList);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGrievanceCount = (uid: string) => {
        return grievances.filter(g => g.submittedBy === uid).length;
    };

    const filteredUsers = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Registered Users</h1>
                        <p className="text-sm text-muted-foreground">Manage and view user statistics</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Grievances Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.uid}>
                                                <TableCell className="font-medium">
                                                    {user.displayName || 'N/A'}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                    {user.department && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({user.department})
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {getGrievanceCount(user.uid)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
