export type TabDataSchema = {
    id: string;
    label: string;
    settings: Setting[]
}

export type Setting = {
    id: string;
    name: string;
    type: 'text' | 'number' | 'radio' | 'switch';
    label: string;
    options: SettingOptions[];
    required: boolean;
    edit: boolean;
}

type SettingOptions = {
    optId?: string;
    value?: string;
    label?: string;
    min?: string;
    max?: string;
    checked: boolean;
}