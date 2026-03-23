// mobile/app/(tabs)/create.tsx  (creator only tab)
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useGetAuthUserQuery,
  useCreateProjectMutation,
} from '../../src/state/api';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';

const CATEGORIES = [
  'education', 'health', 'environment', 'technology',
  'arts', 'community', 'business', 'charity',
];

const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const DISTRICT_MAP: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Gopalganj'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Rangamati', 'Feni', 'Comilla', 'Noakhali'],
  Rajshahi: ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Kushtia'],
  Barisal: ['Barisal', 'Patuakhali', 'Bhola', 'Pirojpur'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

function SelectField({ label, value, options, onSelect }: any) {
  const [open, setOpen] = useState(false);
  return (
    <View style={sf.container}>
      <Text style={sf.label}>{label}</Text>
      <TouchableOpacity style={sf.trigger} onPress={() => setOpen(!open)}>
        <Text style={value ? sf.triggerText : sf.triggerPlaceholder}>
          {value || `Select ${label}`}
        </Text>
        {open ? <ChevronUp color="#666" size={16} /> : <ChevronDown color="#666" size={16} />}
      </TouchableOpacity>
      {open && (
        <View style={sf.dropdown}>
          {options.map((opt: string) => (
            <TouchableOpacity
              key={opt}
              style={[sf.option, value === opt && sf.optionActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[sf.optionText, value === opt && sf.optionTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const sf = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  triggerText: { fontSize: 15, color: '#333' },
  triggerPlaceholder: { fontSize: 15, color: '#999' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
    maxHeight: 200,
    overflow: 'scroll' as any,
  },
  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optionActive: { backgroundColor: '#E8F4FF' },
  optionText: { fontSize: 14, color: '#333', textTransform: 'capitalize' },
  optionTextActive: { color: '#007AFF', fontWeight: '600' },
});

export default function CreateProjectScreen() {
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
    division: '',
    district: '',
    story: '',
    risks: '',
    videoUrl: '',
    tags: '',
  });

  const defaultDelivery = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [tiers, setTiers] = useState([{
    title: '',
    description: '',
    minimumAmount: '',
    estimatedDelivery: defaultDelivery,
    items: [''],
    isActive: true,
  }]);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const addTier = () => setTiers(t => [...t, {
    title: '', description: '', minimumAmount: '',
    estimatedDelivery: '', items: [''], isActive: true,
  }]);

  const removeTier = (i: number) => setTiers(t => t.filter((_, idx) => idx !== i));

  const setTierField = (i: number, key: string, val: any) =>
    setTiers(t => t.map((tier, idx) => idx === i ? { ...tier, [key]: val } : tier));

  const addTierItem = (i: number) =>
    setTiers(t => t.map((tier, idx) => idx === i ? { ...tier, items: [...tier.items, ''] } : tier));

  const setTierItem = (tierIdx: number, itemIdx: number, val: string) =>
    setTiers(t => t.map((tier, idx) =>
      idx === tierIdx
        ? { ...tier, items: tier.items.map((item, ii) => ii === itemIdx ? val : item) }
        : tier
    ));

  const removeTierItem = (tierIdx: number, itemIdx: number) =>
    setTiers(t => t.map((tier, idx) =>
      idx === tierIdx ? { ...tier, items: tier.items.filter((_, ii) => ii !== itemIdx) } : tier
    ));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.targetAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const amount = parseFloat(form.targetAmount);
    if (isNaN(amount) || amount < 1000) {
      Alert.alert('Error', 'Target amount must be at least ৳1,000');
      return;
    }

    try {
      const projectData = {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        category: form.category,
        targetAmount: amount,
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate,
        location: { division: form.division, district: form.district },
        story: form.story,
        risks: form.risks,
        videoUrl: form.videoUrl || undefined,
        images: [],
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        rewardTiers: tiers.map(tier => ({
          title: tier.title,
          description: tier.description,
          minimumAmount: parseFloat(tier.minimumAmount) || 0,
          estimatedDelivery: tier.estimatedDelivery || undefined,
          items: tier.items.filter(Boolean),
          isActive: tier.isActive,
        })),
        status: 'active',
        termsAgreed: true,
      };

      await createProject(projectData).unwrap();
      Alert.alert('Success', 'Project created successfully!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/creator') },
      ]);
    } catch (error: any) {
      // Show EVERYTHING so we can debug
      const errData = error?.data;

      let message = 'Unknown error';

      if (Array.isArray(errData?.errors) && errData.errors.length > 0) {
        message = errData.errors.map((e: any) => {
          const field = e.field || e.path || e.param || JSON.stringify(e);
          const msg = e.message || e.msg || e.error || JSON.stringify(e);
          return field + ': ' + msg;
        }).join('\n');
      } else if (typeof errData?.message === 'string') {
        // Try to also show raw errors if they exist
        const extra = errData.errors ? '\n\nDetails: ' + JSON.stringify(errData.errors) : '';
        message = errData.message + extra;
      } else {
        message = JSON.stringify(error?.data || error, null, 2);
      }

      Alert.alert('Error', message);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Create Project</Text>
        <Text style={s.headerSub}>Launch your crowdfunding campaign</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Basic Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Basic Information</Text>
          <Text style={s.fieldLabel}>Title *</Text>
          <TextInput
            style={s.input}
            value={form.title}
            onChangeText={v => set('title', v)}
            placeholder="Project title"
          />
          <Text style={s.fieldLabel}>Short Description *</Text>
          <TextInput
            style={s.input}
            value={form.shortDescription}
            onChangeText={v => set('shortDescription', v)}
            placeholder="Brief summary (max 200 chars)"
            maxLength={200}
          />
          <Text style={s.fieldLabel}>Full Description *</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={form.description}
            onChangeText={v => set('description', v)}
            placeholder="Detailed description of your project"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <SelectField
            label="Category *"
            value={form.category}
            options={CATEGORIES}
            onSelect={(v: string) => set('category', v)}
          />
        </View>

        {/* Funding & Timeline */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Funding & Timeline</Text>
          <Text style={s.fieldLabel}>Target Amount (BDT) *</Text>
          <TextInput
            style={s.input}
            value={form.targetAmount}
            onChangeText={v => set('targetAmount', v)}
            placeholder="Minimum ৳1,000"
            keyboardType="numeric"
          />
          <Text style={s.fieldLabel}>Start Date *</Text>
          <TextInput
            style={s.input}
            value={form.startDate}
            onChangeText={v => set('startDate', v)}
            placeholder="YYYY-MM-DD"
          />
          <Text style={s.fieldLabel}>End Date *</Text>
          <TextInput
            style={s.input}
            value={form.endDate}
            onChangeText={v => set('endDate', v)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Location */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Location</Text>
          <SelectField
            label="Division *"
            value={form.division}
            options={DIVISIONS}
            onSelect={(v: string) => { set('division', v); set('district', ''); }}
          />
          <SelectField
            label="District *"
            value={form.district}
            options={form.division ? DISTRICT_MAP[form.division] || [] : []}
            onSelect={(v: string) => set('district', v)}
          />
        </View>

        {/* Story */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Story & Risks</Text>
          <Text style={s.fieldLabel}>Project Story *</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={form.story}
            onChangeText={v => set('story', v)}
            placeholder="Share your vision and goals..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={s.fieldLabel}>Risks & Challenges *</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={form.risks}
            onChangeText={v => set('risks', v)}
            placeholder="Describe potential risks..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Reward Tiers */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Reward Tiers</Text>
            <TouchableOpacity style={s.addBtn} onPress={addTier}>
              <Plus color="#007AFF" size={16} />
              <Text style={s.addBtnText}>Add Tier</Text>
            </TouchableOpacity>
          </View>

          {tiers.map((tier, i) => (
            <View key={i} style={s.tierCard}>
              <View style={s.tierHeader}>
                <Text style={s.tierTitle}>Tier {i + 1}</Text>
                {tiers.length > 1 && (
                  <TouchableOpacity onPress={() => removeTier(i)}>
                    <Trash2 color="#FF3B30" size={18} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={s.fieldLabel}>Title *</Text>
              <TextInput
                style={s.input}
                value={tier.title}
                onChangeText={v => setTierField(i, 'title', v)}
                placeholder="e.g. Early Bird Supporter"
              />
              <Text style={s.fieldLabel}>Description *</Text>
              <TextInput
                style={[s.input, s.textareaSm]}
                value={tier.description}
                onChangeText={v => setTierField(i, 'description', v)}
                placeholder="What backers receive..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={s.fieldLabel}>Minimum Amount (BDT) *</Text>
              <TextInput
                style={s.input}
                value={tier.minimumAmount}
                onChangeText={v => setTierField(i, 'minimumAmount', v)}
                placeholder="e.g. 500"
                keyboardType="numeric"
              />
              <Text style={s.fieldLabel}>Est. Delivery Date</Text>
              <TextInput
                style={s.input}
                value={tier.estimatedDelivery}
                onChangeText={v => setTierField(i, 'estimatedDelivery', v)}
                placeholder="YYYY-MM-DD"
              />
              <View style={s.itemsHeader}>
                <Text style={s.fieldLabel}>Reward Items</Text>
                <TouchableOpacity onPress={() => addTierItem(i)}>
                  <Text style={s.addItemText}>+ Add Item</Text>
                </TouchableOpacity>
              </View>
              {tier.items.map((item, ii) => (
                <View key={ii} style={s.itemRow}>
                  <TextInput
                    style={[s.input, { flex: 1, marginBottom: 0 }]}
                    value={item}
                    onChangeText={v => setTierItem(i, ii, v)}
                    placeholder={`Item ${ii + 1}`}
                  />
                  {tier.items.length > 1 && (
                    <TouchableOpacity onPress={() => removeTierItem(i, ii)} style={s.removeItem}>
                      <Text style={s.removeItemText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Media & Tags */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Media & Tags</Text>
          <Text style={s.fieldLabel}>Video URL (Optional)</Text>
          <TextInput
            style={s.input}
            value={form.videoUrl}
            onChangeText={v => set('videoUrl', v)}
            placeholder="YouTube or Vimeo URL"
            keyboardType="url"
          />
          <Text style={s.fieldLabel}>Tags (comma-separated)</Text>
          <TextInput
            style={s.input}
            value={form.tags}
            onChangeText={v => set('tags', v)}
            placeholder="e.g. sustainability, community"
          />
          <View style={s.imageNote}>
            <Text style={s.imageNoteText}>
              📷 Project images can be added after creation via the web platform.
            </Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, isLoading && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={s.submitText}>{isLoading ? 'Creating...' : 'Create Project'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#C8F5D8', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 14 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  textarea: { minHeight: 100 },
  textareaSm: { minHeight: 70 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  tierCard: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addItemText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeItem: {
    width: 32,
    height: 32,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeItemText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
  imageNote: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  imageNoteText: { fontSize: 13, color: '#8B6914' },
  submitBtn: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});