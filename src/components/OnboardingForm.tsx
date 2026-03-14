'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FOOD_BUSINESS_TYPES, COUNCIL_AREAS, COMPANY_TYPES, TURNOVER_BANDS } from '@/lib/constants';
import { saveProfile, saveComplianceMap } from '@/lib/storage';
import type { BusinessProfile, FoodBusinessType, CompanyType, CouncilArea, TurnoverBand } from '@/lib/types';

const TOTAL_STEPS = 4;

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    businessType: '' as FoodBusinessType | '',
    companyType: '' as CompanyType | '',
    councilArea: '' as CouncilArea | '',
    postcode: '',
    employeeCount: 0,
    turnoverBand: '' as TurnoverBand | '',
    vatRegistered: false,
    servesAlcohol: false,
    hasOutdoorSeating: false,
    handlesPersonalData: true,
    financialYearEnd: '',
    incorporationDate: '',
    licenceGrantDate: '',
  });

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        return !!(form.businessName && form.ownerName && form.businessType && form.companyType);
      case 2:
        return !!(form.councilArea && form.postcode && form.turnoverBand);
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const profile: BusinessProfile = {
      businessName: form.businessName,
      ownerName: form.ownerName,
      businessType: form.businessType as FoodBusinessType,
      companyType: form.companyType as CompanyType,
      councilArea: form.councilArea as CouncilArea,
      postcode: form.postcode,
      vatRegistered: form.vatRegistered,
      turnoverBand: form.turnoverBand as TurnoverBand,
      employeeCount: form.employeeCount,
      servesAlcohol: form.servesAlcohol,
      hasOutdoorSeating: form.hasOutdoorSeating,
      handlesPersonalData: form.handlesPersonalData,
      incorporationDate: form.incorporationDate || undefined,
      licenceGrantDate: form.licenceGrantDate || undefined,
      financialYearEnd: form.financialYearEnd || undefined,
      onboardingComplete: true,
    };

    saveProfile(profile);

    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok) throw new Error('API error');

      const complianceMap = await res.json();
      saveComplianceMap({ ...complianceMap, profile });
      router.push('/dashboard');
    } catch {
      setError('Failed to generate compliance map. Redirecting with cached data...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/10">
          <ChefHat className="h-7 w-7 text-brand-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Set Up Your Food Business</h2>
        <p className="mt-1 text-text-secondary">Tell us about your business so we can map your compliance obligations.</p>
      </div>

      <Progress value={(step / TOTAL_STEPS) * 100} className="mb-8 h-2" />

      <Card className="border-brand-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 1 && 'About Your Business'}
            {step === 2 && 'Location & Size'}
            {step === 3 && 'Operations'}
            {step === 4 && 'Key Dates (Optional)'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Basic information about your food business.'}
            {step === 2 && 'Where you operate and how big you are.'}
            {step === 3 && 'What your business does — this determines which regulations apply.'}
            {step === 4 && 'These help us calculate your exact deadlines. You can skip and add them later.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. The Brewed Awakening"
                  value={form.businessName}
                  onChange={e => update('businessName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Your Name</Label>
                <Input
                  id="ownerName"
                  placeholder="e.g. Sarah"
                  value={form.ownerName}
                  onChange={e => update('ownerName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type of Food Business</Label>
                <Select value={form.businessType} onValueChange={v => update('businessType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select your business type" /></SelectTrigger>
                  <SelectContent>
                    {FOOD_BUSINESS_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Company Structure</Label>
                <RadioGroup value={form.companyType} onValueChange={v => update('companyType', v)}>
                  {COMPANY_TYPES.map(t => (
                    <div key={t.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={t.value} id={t.value} />
                      <Label htmlFor={t.value} className="font-normal">{t.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Council Area</Label>
                <Select value={form.councilArea} onValueChange={v => update('councilArea', v)}>
                  <SelectTrigger><SelectValue placeholder="Select your council area" /></SelectTrigger>
                  <SelectContent>
                    {COUNCIL_AREAS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  placeholder="e.g. EH1 2QL"
                  value={form.postcode}
                  onChange={e => update('postcode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">Number of Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  min={0}
                  value={form.employeeCount}
                  onChange={e => update('employeeCount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Turnover</Label>
                <Select value={form.turnoverBand} onValueChange={v => update('turnoverBand', v)}>
                  <SelectTrigger><SelectValue placeholder="Select turnover band" /></SelectTrigger>
                  <SelectContent>
                    {TURNOVER_BANDS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="vat"
                  checked={form.vatRegistered}
                  onCheckedChange={v => update('vatRegistered', !!v)}
                />
                <div>
                  <Label htmlFor="vat" className="font-medium">VAT Registered</Label>
                  <p className="text-sm text-text-secondary">Required if turnover exceeds £85,000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="alcohol"
                  checked={form.servesAlcohol}
                  onCheckedChange={v => update('servesAlcohol', !!v)}
                />
                <div>
                  <Label htmlFor="alcohol" className="font-medium">Serves Alcohol</Label>
                  <p className="text-sm text-text-secondary">Triggers Scottish Licensing Act 2005 obligations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="outdoor"
                  checked={form.hasOutdoorSeating}
                  onCheckedChange={v => update('hasOutdoorSeating', !!v)}
                />
                <div>
                  <Label htmlFor="outdoor" className="font-medium">Outdoor Seating</Label>
                  <p className="text-sm text-text-secondary">Tables/chairs on public pavement require a licence</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="data"
                  checked={form.handlesPersonalData}
                  onCheckedChange={v => update('handlesPersonalData', !!v)}
                />
                <div>
                  <Label htmlFor="data" className="font-medium">Handles Personal Data</Label>
                  <p className="text-sm text-text-secondary">Customer bookings, loyalty schemes, staff records, etc.</p>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="financialYearEnd">Financial Year End</Label>
                <Input
                  id="financialYearEnd"
                  type="date"
                  value={form.financialYearEnd}
                  onChange={e => update('financialYearEnd', e.target.value)}
                />
              </div>
              {form.companyType === 'limited' && (
                <div className="space-y-2">
                  <Label htmlFor="incorporationDate">Company Incorporation Date</Label>
                  <Input
                    id="incorporationDate"
                    type="date"
                    value={form.incorporationDate}
                    onChange={e => update('incorporationDate', e.target.value)}
                  />
                </div>
              )}
              {form.servesAlcohol && (
                <div className="space-y-2">
                  <Label htmlFor="licenceGrantDate">Alcohol Licence Grant Date</Label>
                  <Input
                    id="licenceGrantDate"
                    type="date"
                    value={form.licenceGrantDate}
                    onChange={e => update('licenceGrantDate', e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-deadline-urgent">{error}</p>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="bg-brand-accent hover:bg-blue-600"
              >
                Next <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-brand-accent hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating your compliance map...
                  </>
                ) : (
                  'Generate My Compliance Map'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
