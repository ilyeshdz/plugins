import { For } from "solid-js";
import css from "./dropdown.scss";

const {
    ui: {
        injectCss
    }
} = shelter;

export const unloadDropdownCss = injectCss(css);

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    class?: string;
}

function ChevronDown() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
        </svg>
    );
}

export function Dropdown(props: DropdownProps) {
    return (
        <div class={`dropdown-wrapper ${props.class || ''}`}>
            <select
                class="dropdown-select"
                value={props.value}
                onChange={(e: Event) => props.onChange((e.currentTarget as HTMLSelectElement).value)}
            >
                <For each={props.options} children={(option) => (
                    <option value={option.value}>{option.label}</option>
                )} />
            </select>
            <ChevronDown />
        </div>
    );
}

export default Dropdown;