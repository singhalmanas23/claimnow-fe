import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePolicy } from '@/hooks';

interface CreatePolicyDialogProps {
  onClose: () => void;
}

interface SubLimit {
  id: string;
  key: string;
  type: string;
  description: string;
  value?: number;
  max_cap_per_day?: number;
  per?: string;
  examples: string[];
}

export function CreatePolicyDialog({ onClose }: CreatePolicyDialogProps) {
  const createPolicy = useCreatePolicy();
  const [policyId, setPolicyId] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [sumInsured, setSumInsured] = useState('');
  const [coPaymentPercentage, setCoPaymentPercentage] = useState('');
  const [subLimits, setSubLimits] = useState<SubLimit[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSubLimit = () => {
    setSubLimits([
      ...subLimits,
      {
        id: Date.now().toString(),
        key: '',
        type: 'fixed',
        description: '',
        examples: [],
      },
    ]);
  };

  const removeSubLimit = (id: string) => {
    setSubLimits(subLimits.filter((limit) => limit.id !== id));
  };

  const updateSubLimit = (id: string, field: keyof SubLimit, value: string | number | string[]) => {
    setSubLimits(
      subLimits.map((limit) =>
        limit.id === id ? { ...limit, [field]: value } : limit
      )
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!policyId.trim()) newErrors.policyId = 'Policy ID is required';
    if (!policyName.trim()) newErrors.policyName = 'Policy Name is required';
    if (!sumInsured || Number(sumInsured) < 0) newErrors.sumInsured = 'Valid Sum Insured is required';
    if (!coPaymentPercentage || Number(coPaymentPercentage) < 0 || Number(coPaymentPercentage) > 100) {
      newErrors.coPaymentPercentage = 'Co-payment must be between 0 and 100';
    }

    // Validate sub-limits
    subLimits.forEach((limit, index) => {
      if (!limit.key.trim()) newErrors[`subLimit_${index}_key`] = 'Sub-limit key is required';
      if (!limit.description.trim()) newErrors[`subLimit_${index}_description`] = 'Description is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Convert sub-limits array to object
      const subLimitsObject: Record<string, any> = {};
      subLimits.forEach((limit) => {
        const subLimitData: any = {
          type: limit.type,
          description: limit.description,
        };

        if (limit.value !== undefined && limit.value !== null) {
          subLimitData.value = limit.value;
        }
        if (limit.max_cap_per_day !== undefined && limit.max_cap_per_day !== null) {
          subLimitData.max_cap_per_day = limit.max_cap_per_day;
        }
        if (limit.per) {
          subLimitData.per = limit.per;
        }
        if (limit.examples.length > 0) {
          subLimitData.examples = limit.examples;
        }

        subLimitsObject[limit.key] = subLimitData;
      });

      await createPolicy.mutateAsync({
        policy_id: policyId,
        policy_name: policyName,
        rules: {
          sum_insured: Number(sumInsured),
          co_payment_percentage: Number(coPaymentPercentage),
          sub_limits: subLimitsObject,
        },
      });

      onClose();
    } catch (error: any) {
      console.error('Failed to create policy:', error);
      setErrors({
        submit: error?.response?.data?.detail || 'Failed to create policy. Please try again.',
      });
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="text-gray-900">Create New Policy</DialogTitle>
        <DialogDescription className="text-gray-600">
          Add a new insurance policy with rules and sub-limits.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="space-y-6 pb-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policyId" className="text-gray-700">
                  Policy ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="policyId"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  placeholder="e.g., POL-001"
                  className={`border-gray-300 ${errors.policyId ? 'border-red-500' : ''}`}
                />
                {errors.policyId && <p className="text-xs text-red-600">{errors.policyId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyName" className="text-gray-700">
                  Policy Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="policyName"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g., Premium Health Plan"
                  className={`border-gray-300 ${errors.policyName ? 'border-red-500' : ''}`}
                />
                {errors.policyName && <p className="text-xs text-red-600">{errors.policyName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sumInsured" className="text-gray-700">
                  Sum Insured (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sumInsured"
                  type="number"
                  min="0"
                  value={sumInsured}
                  onChange={(e) => setSumInsured(e.target.value)}
                  placeholder="e.g., 500000"
                  className={`border-gray-300 ${errors.sumInsured ? 'border-red-500' : ''}`}
                />
                {errors.sumInsured && <p className="text-xs text-red-600">{errors.sumInsured}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coPayment" className="text-gray-700">
                  Co-Payment (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="coPayment"
                  type="number"
                  min="0"
                  max="100"
                  value={coPaymentPercentage}
                  onChange={(e) => setCoPaymentPercentage(e.target.value)}
                  placeholder="e.g., 10"
                  className={`border-gray-300 ${errors.coPaymentPercentage ? 'border-red-500' : ''}`}
                />
                {errors.coPaymentPercentage && (
                  <p className="text-xs text-red-600">{errors.coPaymentPercentage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Limits Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-900">Sub-Limits</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addSubLimit}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Sub-Limit
              </Button>
            </div>

            {subLimits.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-4 text-center">
                No sub-limits added. Click "Add Sub-Limit" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {subLimits.map((limit, index) => (
                  <div
                    key={limit.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Sub-Limit #{index + 1}</h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSubLimit(limit.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`key-${limit.id}`} className="text-gray-700">
                          Key <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`key-${limit.id}`}
                          value={limit.key}
                          onChange={(e) => updateSubLimit(limit.id, 'key', e.target.value)}
                          placeholder="e.g., room_rent"
                          className={`border-gray-300 ${
                            errors[`subLimit_${index}_key`] ? 'border-red-500' : ''
                          }`}
                        />
                        {errors[`subLimit_${index}_key`] && (
                          <p className="text-xs text-red-600">{errors[`subLimit_${index}_key`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`type-${limit.id}`} className="text-gray-700">
                          Type
                        </Label>
                        <Select
                          value={limit.type}
                          onValueChange={(value) => updateSubLimit(limit.id, 'type', value)}
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage_of_sum_insured">
                              Percentage of Sum Insured
                            </SelectItem>
                            <SelectItem value="per_day">Per Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`description-${limit.id}`} className="text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`description-${limit.id}`}
                        value={limit.description}
                        onChange={(e) => updateSubLimit(limit.id, 'description', e.target.value)}
                        placeholder="e.g., Maximum room rent allowed per day"
                        rows={2}
                        className={`border-gray-300 ${
                          errors[`subLimit_${index}_description`] ? 'border-red-500' : ''
                        }`}
                      />
                      {errors[`subLimit_${index}_description`] && (
                        <p className="text-xs text-red-600">{errors[`subLimit_${index}_description`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`value-${limit.id}`} className="text-gray-700">
                          Value (₹)
                        </Label>
                        <Input
                          id={`value-${limit.id}`}
                          type="number"
                          min="0"
                          value={limit.value || ''}
                          onChange={(e) =>
                            updateSubLimit(limit.id, 'value', e.target.value ? Number(e.target.value) : undefined as any)
                          }
                          placeholder="e.g., 5000"
                          className="border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`maxCap-${limit.id}`} className="text-gray-700">
                          Max Cap Per Day (₹)
                        </Label>
                        <Input
                          id={`maxCap-${limit.id}`}
                          type="number"
                          min="0"
                          value={limit.max_cap_per_day || ''}
                          onChange={(e) =>
                            updateSubLimit(
                              limit.id,
                              'max_cap_per_day',
                              e.target.value ? Number(e.target.value) : undefined as any
                            )
                          }
                          placeholder="e.g., 2000"
                          className="border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`per-${limit.id}`} className="text-gray-700">
                          Per
                        </Label>
                        <Input
                          id={`per-${limit.id}`}
                          value={limit.per || ''}
                          onChange={(e) => updateSubLimit(limit.id, 'per', e.target.value)}
                          placeholder="e.g., day"
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`examples-${limit.id}`} className="text-gray-700">
                        Examples (comma-separated)
                      </Label>
                      <Input
                        id={`examples-${limit.id}`}
                        value={limit.examples.join(', ')}
                        onChange={(e) =>
                          updateSubLimit(
                            limit.id,
                            'examples',
                            e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          )
                        }
                        placeholder="e.g., ICU bed, Private room"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="flex-shrink-0">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={createPolicy.isPending}
          className="border-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createPolicy.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createPolicy.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
