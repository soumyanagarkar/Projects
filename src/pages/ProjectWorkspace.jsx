// -------------------- React & Router --------------------
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// -------------------- UI & Animation --------------------
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";

// -------------------- Icons --------------------
import {
  Layout,
  MessageSquare,
  Users,
  Activity,
  Loader2,
  AlertCircle,
  Settings,
  Plus,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// -------------------- Local Components --------------------
import Header from "../components/Header";
import KanbanBoard from "./KanbanBoard";
import ProjectChat from "../components/ProjectChat";
import MembersPanel from "../components/MembersPanel";
import ActivityLog from "../components/ActivityLog";
import AddMemberModal from "../modals/AddMemberModal";
import { isAdmin } from "../utils/roleUtils";
import ManageResourcesModal from "../modals/ManageResourcesModal";

// -------------------- Constants --------------------
const NAV_ITEMS = [
  { value: "board", label: "Kanban Board", icon: Layout, color: "text-blue-600" },
  { value: "chat", label: "Team Chat", icon: MessageSquare, color: "text-teal-700" },
  { value: "members", label: "Members", icon: Users, color: "text-green-600" },
  { value: "activity", label: "Activity Log", icon: Activity, color: "text-red-700" },
];

const LINK_CHIP_STYLES = [
  "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
  "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100",
  "bg-green-50 text-green-800 border-green-200 hover:bg-green-100",
  "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
];

const FILE_CHIP_STYLES = [
  "bg-white text-slate-700 border-slate-200 hover:border-slate-400",
  "bg-teal-50 text-teal-800 border-teal-200 hover:border-teal-400",
  "bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400",
  "bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-400",
];

// -------------------- Helpers --------------------
const getAuthToken = () =>
  localStorage.getItem("token") ||
  JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;

const getFullUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (!(url.startsWith('http://') || url.startsWith('https://'))) return '';
  return url;
};

const getStatusClasses = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("active")) return "bg-green-100 text-green-800 border border-green-300";
  if (value.includes("progress")) return "bg-blue-100 text-blue-800 border border-blue-300";
  if (value.includes("hold")) return "bg-amber-100 text-amber-800 border border-amber-300";
  if (value.includes("complete")) return "bg-teal-100 text-teal-800 border border-teal-300";
  return "bg-slate-100 text-slate-700 border border-slate-300";
};

// -------------------- Main Component --------------------
const ProjectWorkspace = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("board");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshProjectData = async () => {
    await fetchProject();
    setRefreshCount(prev => prev + 1);
  };

  const fetchProject = async () => {
    try {
      console.log("Fetching project with ID:", projectId);
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Fetch response status:", res.status);
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const errText = await res.text();
        console.error("Fetch error text:", errText);
        throw new Error("Workspace data unreachable");
      }

      const data = await res.json();
      console.log("Project data received:", data);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  if (loading) return <LoadingState />;
  if (error || !project) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF0] via-white to-[#FAFAF0] text-slate-900 antialiased relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#FFC300]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -right-20 w-80 h-80 rounded-full bg-[#008080]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-[#4CAF50]/12 blur-3xl" />
      <Header />

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 relative z-10">
        {/* ================= PROJECT HEADER ================= */}
        <section className="mb-12 space-y-10 bg-white/80 backdrop-blur-sm rounded-[36px] p-8 md:p-10 border border-white shadow-[0_20px_70px_-30px_rgba(15,23,42,0.35)]">


          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                  {project.name}
                </h1>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${getStatusClasses(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <p className="max-w-2xl text-lg text-slate-500">
                {project.description ||
                  "Deploy resources, manage sprints, and collaborate with your team."}
              </p>

              {/* Links & Attachments Display */}
              <div className="flex flex-col gap-4 mt-6">
                {/* Git Link */}
                {project.gitLink && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 min-w-[70px]">Repository</span>
                    <a
                      href={project.gitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      View on Git
                    </a>
                  </div>
                )}

                {/* Related Links */}
                {project.relatedLinks && project.relatedLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 min-w-[70px]">Links</span>
                    <div className="flex flex-wrap gap-2">
                      {project.relatedLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.startsWith('http') ? link : `https://${link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${LINK_CHIP_STYLES[idx % LINK_CHIP_STYLES.length]}`}
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          {link.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {project.attachments && project.attachments.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 min-w-[70px] mt-2">Files</span>
                    <div className="flex flex-wrap gap-2">
                      {project.attachments.map((file, idx) => {
                        const fileUrl = getFullUrl(file);
                        const fileName = typeof file === 'string' ? file.split('/').pop().split('?')[0] : `File ${idx + 1}`;
                        return (
                          <div key={idx} className="flex items-center group">
                            {fileUrl ? (
                              <>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border hover:shadow-sm transition-all ${FILE_CHIP_STYLES[idx % FILE_CHIP_STYLES.length]}`}
                                >
                                  <Layers className="w-3 h-3 text-slate-400" />
                                  {fileName}
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(fileUrl);
                                    alert("Link copied to clipboard!");
                                  }}
                                  className="ml-1 p-1.5 text-slate-400 hover:text-teal-700 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Copy full link"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <span
                                title="Invalid attachment URL. Remove and upload again from Manage Resources."
                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg text-xs font-bold text-amber-800 border border-amber-200"
                              >
                                <Layers className="w-3 h-3 text-amber-600" />
                                {fileName} (re-upload needed)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start">
              {isAdmin(project.userRole) && (
                <>
                  <button
                    onClick={() => setIsManageModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#008080] to-[#2563EB] text-white border border-[#008080] rounded-2xl font-bold text-sm hover:brightness-105 transition-all shadow-lg shadow-teal-200"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Resources
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFC300] to-[#4CAF50] text-slate-900 rounded-2xl font-bold text-sm hover:brightness-105 transition-all shadow-lg shadow-amber-200"
                  >
                    <Users className="w-4 h-4" />
                    Add Members
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-8 pt-10 border-t border-slate-200/80">
            <MetaBlock icon={Calendar} label="Created" value="Feb 2026" />
            <MetaBlock
              icon={Users}
              label="Collaborators"
              value={`${project.members?.length || 0} Members`}
            />

          </div>
        </section >

        {/* ================= WORKSPACE ================= */}
        < Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12"
        >
          <aside className="space-y-10">
            <Tabs.List className="flex flex-col gap-2 bg-white/85 backdrop-blur-sm rounded-3xl border border-[#E5E7EB] p-3 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.45)]">
              {NAV_ITEMS.map((item) => (
                <Tabs.Trigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#008080] data-[state=active]:to-[#2563EB] data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-amber-50/70"
                >
                  <item.icon className={`w-5 h-5 ${item.color} data-[state=active]:text-white`} />
                  {item.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </aside>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/90 backdrop-blur-sm rounded-[48px] shadow-xl border border-white p-10 min-h-[700px]"
            >
              <Tabs.Content value="board"><KanbanBoard projectId={projectId} userRole={project.userRole} onMemberUpdate={refreshCount} /></Tabs.Content>
              <Tabs.Content value="chat"><ProjectChat projectId={projectId} /></Tabs.Content>
              <Tabs.Content value="members"><MembersPanel projectId={projectId} onMemberUpdate={refreshCount} onGlobalRefresh={refreshProjectData} /></Tabs.Content>
              <Tabs.Content value="activity"><ActivityLog projectId={projectId} /></Tabs.Content>
            </motion.div>
          </AnimatePresence>
        </Tabs.Root >
      </main >

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId}
        onAddSuccess={() => {
          refreshProjectData();
        }}
      />

      <ManageResourcesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        project={project}
        onUpdate={(updatedProject) => {
          setProject(updatedProject);
          refreshProjectData();
        }}
      />
    </div >
  );
};

// -------------------- Atomic Components --------------------
const MetaBlock = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center border">
      <Icon className="w-4 h-4 text-slate-400" />
    </div>
    <div>
      <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
      <p className="text-sm font-bold">{value}</p>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="h-screen flex items-center justify-center">
    <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
  </div>
);

const ErrorState = ({ error }) => (
  <div className="h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
      <p className="font-bold">{error}</p>
    </div>
  </div>
);

export default ProjectWorkspace;
