import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit, RefreshCw, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
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
import { usePolicy, usePartialUpdatePolicy, useUpdatePolicy } from '@/hooks';
import type { PolicyRules, SubLimitRule } from '@/lib/api-types';

interface PolicyDetailsDialogProps {
  policyId: string;
  open: boolean;
  onClose: () => void;
}

type EditMode = 'view' | 'partial' | 'full';

interface SubLimitForm {
  id: string;
  key: string;
  type: string;
  description: string;
  value?: number;
  max_cap_per_day?: number;
  per?: string;
  examples: string[];
}

export function PolicyDetailsDialog({ policyId, open, onClose }: PolicyDetailsDialogProps) {
  const { data: policy, isLoading, refetch } = usePolicy(policyId);
  const partialUpdate = usePartialUpdatePolicy();
  const fullUpdate = useUpdatePolicy();
  
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [formData, setFormData] = useState({
    policy_name: '',
    sum_insured: 0,
    co_payment_percentage: 0,
    sub_limits: [] as SubLimitForm[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when policy loads or edit mode changes
  useEffect(() => {
    if (policy) {
      setFormData({
        policy_name: policy.policy_name,
        sum_insured: policy.rules.sum_insured,
        co_payment_percentage: policy.rules.co_payment_percentage,
        sub_limits: Object.entries(policy.rules.sub_limits).map(([key, value]) => ({
          id: Date.now().toString() + Math.random(),
          key,
          type: value.type || 'fixed',
          description: value.description || '',
          value: value.value,
          max_cap_per_day: value.max_cap_per_day,
          per: value.per,
          examples: value.examples || [],
        })),
      });
    }
  }, [policy, editMode]);

  const resetForm = () => {
    setEditMode('view');
    setErrors({});
    if (policy) {
      setFormData({
        policy_name: policy.policy_name,
        sum_insured: policy.rules.sum_insured,
        co_payment_percentage: policy.rules.co_payment_percentage,
        sub_limits: Object.entries(policy.rules.sub_limits).map(([key, value]) => ({
          id: Date.now().toString() + Math.random(),
          key,
          type: value.type || 'fixed',
          description: value.description || '',
          value: value.value,
          max_cap_per_day: value.max_cap_per_day,
          per: value.per,
          examples: value.examples || [],
        })),
      });
    }
  };

  const validateForm = (isFullUpdate: boolean): boolean => {
    const newErrors: Record<string, string> = {};

    if (isFullUpdate || editMode === 'full') {
      if (!formData.policy_name.trim()) newErrors.policy_name = 'Policy Name is required';
      if (!formData.sum_insured || formData.sum_insured < 0) {
        newErrors.sum_insured = 'Valid Sum Insured is required';
      }
      if (formData.co_payment_percentage < 0 || formData.co_payment_percentage > 100) {
        newErrors.co_payment_percentage = 'Co-payment must be between 0 and 100';
      }
    }

    // Validate sub-limits
    formData.sub_limits.forEach((limit, index) => {
      if (!limit.key.trim()) newErrors[`subLimit_${index}_key`] = 'Sub-limit key is required';
      if (!limit.description.trim()) {
        newErrors[`subLimit_${index}_description`] = 'Description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertSubLimitsToObject = (): Record<string, SubLimitRule> => {
    const subLimitsObject: Record<string, SubLimitRule> = {};
    formData.sub_limits.forEach((limit) => {
      const subLimitData: SubLimitRule = {
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
    return subLimitsObject;
  };

  const handlePartialUpdate = async () => {
    if (!validateForm(false)) return;

    try {
      const updates: any = {};

      // Only include changed fields
      if (formData.policy_name !== policy?.policy_name) {
        updates.policy_name = formData.policy_name;
      }

      const rulesUpdates: any = {};
      if (formData.sum_insured !== policy?.rules.sum_insured) {
        rulesUpdates.sum_insured = formData.sum_insured;
      }
      if (formData.co_payment_percentage !== policy?.rules.co_payment_percentage) {
        rulesUpdates.co_payment_percentage = formData.co_payment_percentage;
      }

      // Check if sub-limits changed
      const currentSubLimits = JSON.stringify(
        Object.entries(policy?.rules.sub_limits || {}).sort()
      );
      const newSubLimits = JSON.stringify(
        Object.entries(convertSubLimitsToObject()).sort()
      );
      if (currentSubLimits !== newSubLimits) {
        rulesUpdates.sub_limits = convertSubLimitsToObject();
      }

      if (Object.keys(rulesUpdates).length > 0) {
        updates.rules = rulesUpdates;
      }

      if (Object.keys(updates).length === 0) {
        setEditMode('view');
        return;
      }

      await partialUpdate.mutateAsync({
        policyId,
        updates,
      });

      await refetch();
      setEditMode('view');
      setErrors({});
    } catch (error: any) {
      console.error('Failed to update policy:', error);
      setErrors({
        submit: error?.response?.data?.detail || 'Failed to update policy. Please try again.',
      });
    }
  };

  const handleFullUpdate = async () => {
    if (!validateForm(true)) return;

    try {
      await fullUpdate.mutateAsync({
        policyId,
        policy: {
          policy_name: formData.policy_name,
          rules: {
            sum_insured: formData.sum_insured,
            co_payment_percentage: formData.co_payment_percentage,
            sub_limits: convertSubLimitsToObject(),
          },
        },
      });

      await refetch();
      setEditMode('view');
      setErrors({});
    } catch (error: any) {
      console.error('Failed to update policy:', error);
      setErrors({
        submit: error?.response?.data?.detail || 'Failed to update policy. Please try again.',
      });
    }
  };

  const addSubLimit = () => {
    setFormData({
      ...formData,
      sub_limits: [
        ...formData.sub_limits,
        {
          id: Date.now().toString() + Math.random(),
          key: '',
          type: 'fixed',
          description: '',
          examples: [],
        },
      ],
    });
  };

  const removeSubLimit = (id: string) => {
    setFormData({
      ...formData,
      sub_limits: formData.sub_limits.filter((limit) => limit.id !== id),
    });
  };

  const updateSubLimit = (
    id: string,
    field: keyof SubLimitForm,
    value: string | number | string[]
  ) => {
    setFormData({
      ...formData,
      sub_limits: formData.sub_limits.map((limit) =>
        limit.id === id ? { ...limit, [field]: value } : limit
      ),
    });
  };

  const isEditing = editMode !== 'view';
  const isLoadingMutation = partialUpdate.isPending || fullUpdate.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
          <DialogTitle className="text-gray-900">Policy Details</DialogTitle>
          <DialogDescription className="text-gray-600">
                {editMode === 'view' && 'View policy information'}
                {editMode === 'partial' && 'Quick edit - Update only changed fields'}
                {editMode === 'full' && 'Full edit - Update all fields'}
          </DialogDescription>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setEditMode('full')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : policy ? (
            <div className="space-y-6 pb-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label className="text-gray-600 text-sm">Policy ID</Label>
                  <p className="font-medium text-gray-900">{policy.policy_id}</p>
                </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="policy_name" className="text-gray-600 text-sm">
                      Policy Name {editMode === 'full' && <span className="text-red-500">*</span>}
                    </Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="policy_name"
                          value={formData.policy_name}
                          onChange={(e) =>
                            setFormData({ ...formData, policy_name: e.target.value })
                          }
                          className={`border-gray-300 ${errors.policy_name ? 'border-red-500' : ''}`}
                        />
                        {errors.policy_name && (
                          <p className="text-xs text-red-600">{errors.policy_name}</p>
                        )}
                      </>
                    ) : (
                  <p className="font-medium text-gray-900">{policy.policy_name}</p>
                    )}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sum_insured" className="text-gray-600 text-sm">
                      Sum Insured (₹) {editMode === 'full' && <span className="text-red-500">*</span>}
                    </Label>
                    {isEditing ? (
                      <>
                        <Input
                          id="sum_insured"
                          type="number"
                          min="0"
                          value={formData.sum_insured}
                          onChange={(e) =>
                            setFormData({ ...formData, sum_insured: Number(e.target.value) })
                          }
                          className={`border-gray-300 ${errors.sum_insured ? 'border-red-500' : ''}`}
                        />
                        {errors.sum_insured && (
                          <p className="text-xs text-red-600">{errors.sum_insured}</p>
                        )}
                      </>
                    ) : (
                      <p className="font-medium text-gray-900">
                        ₹{policy.rules.sum_insured.toLocaleString()}
                      </p>
                    )}
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="co_payment" className="text-gray-600 text-sm">
                      Co-Payment (%) {editMode === 'full' && <span className="text-red-500">*</span>}
                    </Label>
                  {isEditing ? (
                      <>
                      <Input
                          id="co_payment"
                        type="number"
                        min="0"
                        max="100"
                          value={formData.co_payment_percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              co_payment_percentage: Number(e.target.value),
                            })
                          }
                          className={`border-gray-300 ${errors.co_payment_percentage ? 'border-red-500' : ''}`}
                        />
                        {errors.co_payment_percentage && (
                          <p className="text-xs text-red-600">{errors.co_payment_percentage}</p>
                        )}
                      </>
                    ) : (
                      <p className="font-medium text-gray-900">
                        {policy.rules.co_payment_percentage}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-Limits Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Sub-Limits</h3>
                  {isEditing && (
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
                  )}
              </div>

                {formData.sub_limits.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4 text-center">
                    No sub-limits defined
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.sub_limits.map((limit, index) => (
                      <div
                        key={limit.id}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            Sub-Limit #{index + 1}
                          </h4>
                          {isEditing && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSubLimit(limit.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {isEditing ? (
                          <>
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
                                  <p className="text-xs text-red-600">
                                    {errors[`subLimit_${index}_key`]}
                                  </p>
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
                                onChange={(e) =>
                                  updateSubLimit(limit.id, 'description', e.target.value)
                                }
                                placeholder="e.g., Maximum room rent allowed per day"
                                rows={2}
                                className={`border-gray-300 ${
                                  errors[`subLimit_${index}_description`] ? 'border-red-500' : ''
                                }`}
                              />
                              {errors[`subLimit_${index}_description`] && (
                                <p className="text-xs text-red-600">
                                  {errors[`subLimit_${index}_description`]}
                                </p>
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
                                    updateSubLimit(
                                      limit.id,
                                      'value',
                                      e.target.value ? Number(e.target.value) : undefined as any
                                    )
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
                          </>
                        ) : (
                          <div className="space-y-2">
                        <p className="font-medium capitalize text-gray-900">
                              {limit.key.replace(/_/g, ' ')}
                            </p>
                            {limit.description && (
                              <p className="text-gray-600 text-sm">{limit.description}</p>
                            )}
                            <div className="flex gap-4 text-sm text-gray-700">
                              {limit.value && <p>Value: ₹{limit.value}</p>}
                              {limit.max_cap_per_day && (
                                <p>Max Cap/Day: ₹{limit.max_cap_per_day}</p>
                              )}
                              {limit.per && <p>Per: {limit.per}</p>}
                            </div>
                            {limit.examples.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Examples: {limit.examples.join(', ')}
                          </p>
                        )}
                          </div>
                        )}
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
          ) : (
            <p className="text-center text-gray-500 py-8">Policy not found</p>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isLoadingMutation}
                className="border-gray-300"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              {editMode === 'partial' ? (
                <Button
                  onClick={handlePartialUpdate}
                  disabled={isLoadingMutation}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoadingMutation ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes (Partial)
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleFullUpdate}
                  disabled={isLoadingMutation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingMutation ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save All (Full Update)
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
