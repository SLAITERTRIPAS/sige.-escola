import React, { useState } from "react";
import { useStore } from "../store";
import { Card, Button } from "../components/ui";
import {
  FileCheck,
  Clock,
  CheckCircle,
  MessageSquare,
  LayoutDashboard,
  Calendar,
  FileText,
  BarChart2,
  FileSignature,
  BookOpen,
} from "lucide-react";
import { GovernanceChat } from "../components/GovernanceChat";
import { OfficialMessages } from "../components/OfficialMessages";
import { SidebarMenu } from "../components/SidebarMenu";
import { DirectorOverviewStats } from "../components/DirectorOverviewStats";
import { AcademicManagement } from "../components/AcademicManagement";
import { SignatureManager } from "../components/SignatureManager";
import { TeacherEmailNotifications } from "../components/TeacherEmailNotifications";
import { AcademicCalendarComponent } from "../components/AcademicCalendarComponent";

type Tab = "overview" | "academic" | "calendar" | "reports" | "statistics" | "signature" | "messages" | "emails";

export function DirectorDashboard() {
  const { reports, classes, signReport } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const pendingReports = reports.filter(r => r.status === 'submitted' || r.status === 'draft');

  const handleSign = (reportId: string) => {
    signReport(reportId);
    alert("Relatório visado com sucesso pelo Director da Escola!");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <SidebarMenu activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as Tab)} role="director" />
      
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Painel da Direcção da Escola</h1>
            <p className="text-sm text-slate-500 mt-1">Gestão institucional, visto de relatórios pedagógicos e arquivos oficiais (MINEDH).</p>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <DirectorOverviewStats />
            
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileCheck className="text-blue-700" /> Relatórios Trimestrais Pendentes de Visto
              </h3>
              <div className="space-y-3">
                {pendingReports.map(rep => (
                  <div key={rep.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">Turma ID: {rep.classId} — {rep.trimester}º Trimestre</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Estado: <span className="font-semibold uppercase text-amber-700">{rep.status}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedReportId(rep.id)} className="text-xs font-bold">Ver Relatório</Button>
                      <Button onClick={() => handleSign(rep.id)} className="text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white gap-1.5">
                        <FileSignature size={14} /> Vistar Relatório
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingReports.length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center font-medium">Nenhum relatório pendente de visto neste momento.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "academic" && <AcademicManagement />}
        {activeTab === "calendar" && <AcademicCalendarComponent />}
        {activeTab === "signature" && <SignatureManager />}
        {activeTab === "emails" && <TeacherEmailNotifications />}
        {activeTab === "messages" && <OfficialMessages />}
      </main>
    </div>
  );
}
