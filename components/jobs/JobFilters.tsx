'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobFilters as FilterType } from '@/services/jobs.api';

interface JobFiltersProps {
  initialFilters?: FilterType;
}

export function JobFilters({ initialFilters }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [remote, setRemote] = useState(initialFilters?.remote || false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(initialFilters?.skills || []);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (skills.length) params.set('skills', skills.join(','));
    if (location) params.set('location', location);
    if (remote) params.set('remote', 'true');
    
    router.push(`/jobs?${params.toString()}`);
  };

  const clearFilters = () => {
    setSkills([]);
    setLocation('');
    setRemote(false);
    setSkillInput('');
    router.push('/jobs');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Filters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Skills</label>
            <Input
              placeholder="Type skill & press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1.5 hover:text-primary/70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Location</label>
            <Input
              placeholder="City, Country..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={remote}
              onChange={(e) => setRemote(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="remote" className="text-sm font-medium">Remote Only</label>
          </div>

          <div className="pt-2 flex gap-2">
            <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
            <Button variant="outline" onClick={clearFilters} className="w-full">Clear</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
