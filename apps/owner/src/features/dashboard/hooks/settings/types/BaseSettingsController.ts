export interface BaseSettingsController {
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleReset: () => void;
}
