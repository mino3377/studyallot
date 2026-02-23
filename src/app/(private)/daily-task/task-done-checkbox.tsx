"use client";
import { Checkbox } from '../../../components/ui/checkbox';

export default function TaskDoneCheckbox({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (value:boolean) => void; }) {
    return (
        <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange
            }
            aria-label="完了チェック"
        />
    )
}
