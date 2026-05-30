export type TabType = 'added' | 'left' | 'coming' | 'leaving';

export interface TabDefinition {
	id: TabType;
	label: string;
}