import type { Service } from '../../types';

export interface ServicesManagerProps {
  services: Service[];
  onServicesChanged: (next: Service[]) => void;
}

// Stub — the full services manager UI is implemented in Task T7.
export function ServicesManager({ services }: ServicesManagerProps) {
  return (
    <div>
      <h3>Dịch vụ</h3>
      <ul>
        {services.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ServicesManager;
