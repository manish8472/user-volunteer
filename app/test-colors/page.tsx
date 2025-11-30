import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ColorsTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Color System Test</h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Colors in action</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              <p className="font-semibold">Primary</p>
              <p className="text-sm">Blue (#0EA5E9)</p>
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
              <p className="font-semibold">Secondary</p>
              <p className="text-sm">Green (#10B981)</p>
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded-lg">
              <p className="font-semibold">Accent</p>
              <p className="text-sm">Amber (#FBBF24)</p>
            </div>
            <div className="p-4 bg-destructive text-destructive-foreground rounded-lg">
              <p className="font-semibold">Destructive</p>
              <p className="text-sm">Red (#EF4444)</p>
            </div>
            <div className="p-4 bg-muted text-muted-foreground rounded-lg">
              <p className="font-semibold">Muted</p>
              <p className="text-sm">Gray</p>
            </div>
            <div className="p-4 bg-card text-card-foreground rounded-lg border">
              <p className="font-semibold">Card</p>
              <p className="text-sm">Background</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Auth Pages</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
            <Link href="/auth/signup/volunteer">
              <Button variant="outline">Go to Volunteer Signup</Button>
            </Link>
            <Link href="/auth/signup/ngo">
              <Button variant="outline">Go to NGO Signup</Button>
            </Link>
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border space-y-4">
          <h2 className="text-2xl font-semibold">Color Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Light Mode</h3>
              <ul className="space-y-1">
                <li>Primary: <span className="text-primary font-mono">#0EA5E9</span> (Sky Blue)</li>
                <li>Secondary: <span className="text-secondary font-mono">#10B981</span> (Emerald Green)</li>
                <li>Accent: <span className="font-mono">#FBBF24</span> (Amber)</li>
                <li>Destructive: <span className="text-destructive font-mono">#EF4444</span> (Red)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Dark Mode</h3>
              <ul className="space-y-1">
                <li>Primary: <span className="font-mono">#38BDF8</span> (Lighter Sky Blue)</li>
                <li>Secondary: <span className="font-mono">#34D399</span> (Lighter Emerald)</li>
                <li>Accent: <span className="font-mono">#FCD34D</span> (Lighter Amber)</li>
                <li>Destructive: <span className="font-mono">#F87171</span> (Lighter Red)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
