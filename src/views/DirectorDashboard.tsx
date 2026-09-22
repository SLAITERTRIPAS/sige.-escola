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
} from "lucide-react";
import React, { useState } from "react";
import { GovernanceChat } from "../components/GovernanceChat";
import { CollapsibleSidebar } from "../components/CollapsibleSidebar";
import { SidebarMenu } from "../components/SidebarMenu";

export function DirectorDashboard() {
  const { reports, classes, signReport } = useStore();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const pendingReports = reports.filter(
    (r) => r.status === "submitted_to_director",
  );
  const signedReports = reports.filter(
    (r) => r.status === "signed_by_director" || r.status === "published",
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Gabinete do Diretor
          </h2>
          <p className="text-slate-500 text-sm">
            Gestão executiva e comunicação distrital.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("pautas")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "pautas"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Pautas e Decisões
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comunicação Distrital
          </button>
        </div>
      </div>

      {activeTab === "pautas" ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-yellow-600 h-5 w-5" /> Pautas Pendentes de
              Assinatura
            </h3>
            {/* ... rest of existing pautas code ... */}
            {pendingReports.length === 0 ? (
              <p className="text-gray-500 italic">
                Não há pautas pendentes no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingReports.map((report) => {
                  const turma = classes.find((c) => c.id === report.classId);
                  return (
                    <Card
                      key={report.id}
                      className="p-6 border-l-4 border-l-yellow-500"
                    >
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Pauta Geral - {turma?.name}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {report.trimester}º Trimestre
                      </p>
                      <Button
                        onClick={() => signReport(report.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        <FileCheck className="h-4 w-4" /> Assinar e Devolver
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600 h-5 w-5" /> Histórico de
              Pautas Assinadas
            </h3>
            {signedReports.length === 0 ? (
              <p className="text-gray-500 italic">
                Nenhum histórico disponível.
              </p>
            ) : (
              <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {signedReports.map((report) => {
                    const turma = classes.find((c) => c.id === report.classId);
                    return (
                      <li
                        key={report.id}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {turma?.name} - {report.trimester}º Trimestre
                          </p>
                          <p className="text-sm text-gray-500">
                            Estado:{" "}
                            {report.status === "published"
                              ? "Publicada"
                              : "Aguardando Publicação"}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <GovernanceChat />
        </div>
      )}
    </div>
  );
}
