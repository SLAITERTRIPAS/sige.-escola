import { useStore } from '../store';
import { Card } from '../components/ui';
import { Building2 } from 'lucide-react';

export function AdminDashboard() {
  const { schools } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Painel do Administrador Geral</h2>
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="text-blue-600 h-6 w-6" />
          <h3 className="text-lg font-semibold text-gray-900">Escolas Registadas</h3>
        </div>
        <div className="space-y-4">
          {schools.map(school => (
            <div key={school.id} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{school.name}</p>
                <p className="text-sm text-gray-500">{school.address}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Ativa</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
