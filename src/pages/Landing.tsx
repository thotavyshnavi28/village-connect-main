import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Users, Droplets, ArrowRight, Languages, Globe2, BookOpen, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Language = 'en' | 'te';

const TRANSLATIONS = {
  en: {
    title: {
      line1: 'Village Grievance',
      line2: '& Water Conservation'
    },
    subtitle: 'Together for a better village. Report issues, save water, and build a sustainable community.',
    hero_cta: 'Get Started',
    login_cta: 'Already have an account? Sign In',
    features: {
      community: 'Community Driven',
      water: 'Water Preservation',
      transparent: 'Transparent'
    },
    water_section: {
      title: 'Every Drop Counts',
      description: 'Water is life. In our village, we must work together to preserve this precious resource for our future generations.',
      tips_title: 'How You Can Help:',
      tips: [
        'Fix leaking taps immediately.',
        'Use buckets instead of hose pipes for washing.',
        'Harvest rainwater during monsoons.',
        'Report broken public pipes instantly.'
      ]
    },
    footer: 'Serving our village community with care'
  },
  te: {
    title: {
      line1: 'గ్రామ ఫిర్యాదుల',
      line2: '& నీటి సంరక్షణ వ్యవస్థ'
    },
    subtitle: 'మెరుగైన గ్రామం కోసం అందరం కలిసికట్టుగా. సమస్యలను నివేదించండి, నీటిని ఆదా చేయండి మరియు సుస్థిర సమాజాన్ని నిర్మించండి.',
    hero_cta: 'ప్రారంభించండి',
    login_cta: 'ఖాతా ఉందా? లాగిన్ అవ్వండి',
    features: {
      community: 'ప్రజా భాగస్వామ్యం',
      water: 'నీటి సంరక్షణ',
      transparent: 'పారదర్శకత'
    },
    water_section: {
      title: 'ప్రతి నీటి బొట్టు విలువైనది',
      description: 'నీరే ప్రాణాధారం. మన గ్రామంలో, మన భవిష్యత్తు తరాల కోసం ఈ విలువైన వనరును కాపాడుకోవడానికి మనమందరం కలిసి పనిచేయాలి.',
      tips_title: 'మీరు ఎలా సహాయపడగలరు:',
      tips: [
        'లీకైన కుళాయిలను వెంటనే బాగు చేయండి.',
        'కడిగేందుకు పైపులకు బదులుగా బకెట్లను వాడండి.',
        'వర్షపు నీటిని నిల్వ చేయండి (Rainwater Harvesting).',
        'పగిలిన ప్రభుత్వ పైపుల గురించి వెంటనే ఫిర్యాదు చేయండి.'
      ]
    },
    footer: 'మా గ్రామ ప్రజల సేవలో'
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    if (currentUser && userData) {
      navigate('/community');
    }
  }, [currentUser, userData, navigate]);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar */}
      <div className="w-full px-6 py-4 flex justify-between items-center absolute top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Logo placeholder if needed */}
        </div>
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm">
          <Globe2 className="w-4 h-4 ml-2 text-muted-foreground" />
          <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
            <SelectTrigger className="w-[110px] h-8 border-0 bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="te">తెలుగు</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 shadow-lg shadow-blue-500/20 mb-8">
            <Droplets className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t.title.line1}
            <span className="block text-primary mt-2">{t.title.line2}</span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-lg mx-auto">
            {t.subtitle}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="flex flex-col items-center p-4 rounded-xl bg-card/80 border border-border/50 shadow-sm backdrop-blur-sm">
              <Users className="w-6 h-6 text-primary mb-2" />
              <span className="text-sm font-medium text-foreground">{t.features.community}</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 shadow-sm backdrop-blur-sm">
              <Droplets className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-foreground">{t.features.water}</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card/80 border border-border/50 shadow-sm backdrop-blur-sm">
              <Shield className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-foreground">{t.features.transparent}</span>
            </div>
          </div>

          {/* Water Conservation Section */}
          <div className="mb-12 text-left bg-blue-50 dark:bg-blue-950/30 p-6 md:p-8 rounded-2xl border border-blue-100 dark:border-blue-900">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full shrink-0">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">{t.water_section.title}</h3>
                <p className="text-blue-800 dark:text-blue-300 mb-4 leading-relaxed">
                  {t.water_section.description}
                </p>
                <div className="space-y-3">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t.water_section.tips_title}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {t.water_section.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto sm:max-w-none">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto text-lg h-12 px-8 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/select-role?mode=signup')}
            >
              {t.hero_cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg h-12 px-8"
              onClick={() => navigate('/select-role?mode=login')}
            >
              <Languages className="w-4 h-4 mr-2" />
              {t.login_cta}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border bg-muted/20">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
