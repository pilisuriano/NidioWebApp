import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Barra de pestañas accesible (role="tablist"): flechas, Inicio y Fin para moverse.
 * El contenido de cada pestaña lo dibuja quien la usa, con role="tabpanel" y los ids
 * `${idPrefix}-panel-${id}` (aria-labelledby: `${idPrefix}-tab-${id}`).
 *
 * tabs: [{ id, label, icon? }]
 */
const tabId = (idPrefix, id) => `${idPrefix}-tab-${id}`;
const panelId = (idPrefix, id) => `${idPrefix}-panel-${id}`;

export function Tabs({ tabs, active, onChange, idPrefix, ariaLabel, className }) {
  const refs = useRef({});

  function handleKeyDown(event, index) {
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    const tab = tabs[next];
    onChange(tab.id);
    refs.current[tab.id]?.focus();
  }

  return <div role="tablist" aria-label={ariaLabel} className={cn("flex gap-1 border-b border-outline-variant overflow-x-auto", className)}>
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        const Icon = tab.icon;
        return <button
          key={tab.id}
          ref={node => { refs.current[tab.id] = node; }}
          type="button"
          role="tab"
          id={tabId(idPrefix, tab.id)}
          aria-selected={selected}
          aria-controls={panelId(idPrefix, tab.id)}
          tabIndex={selected ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={event => handleKeyDown(event, index)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-3 -mb-px text-sm font-bold whitespace-nowrap border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-md",
            selected ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
          )}>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {tab.label}
        </button>;
      })}
    </div>;
}
