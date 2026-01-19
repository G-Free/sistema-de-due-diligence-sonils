import React, { useState, useMemo, useEffect, useRef } from "react";
import { generateSupplierEvaluationSummary } from "../services/gemini";
import {
  Entity,
  HistoryItem,
  EntityType,
  ModuleChangeProps,
  ApprovalQueueItem,
} from "../types";
import { mockEntities, mockHistory, mockApprovalQueue } from "../data/mockData";
import HistoryDetailModal from "../components/HistoryDetailModal";
import { criteriaMatrix } from "../data/matrixData";
import { WarningIcon } from "../components/icons/WarningIcon";
import { useToast } from "../components/useToast";
import AddEntityModal from "../components/AddEntityModal";
import { PlusIcon } from "../components/icons/PlusIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { EyeIcon } from "../components/icons/EyeIcon";

const evaluationOptions = [
  "A - Favorável",
  "C - Não Favorável",
  "D - Pendente",
];

const scoreMap: Record<string, number> = {
  "A - Favorável": 5,
  "C - Não Favorável": 1,
  "D - Pendente": 1,
};

const classificationConfig: Record<
  string,
  { text: string; color: string; badge: string }
> = {
  "A - Favorável": {
    text: "A - Favorável",
    color: "text-success",
    badge: "bg-success/20 text-success",
  },
  "B - Favorável com Ressalvas": {
    text: "B - Favorável com Ressalvas",
    color: "text-warning",
    badge: "bg-warning/20 text-warning",
  },
  "C - Não Favorável": {
    text: "C - Não Favorável",
    color: "text-danger",
    badge: "bg-danger/20 text-danger",
  },
};

const InfoItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-sm font-medium text-text-secondary">{label}</dt>
    <dd className="mt-1 text-sm text-text-main font-semibold">{value}</dd>
  </div>
);

const EditableInfoItem: React.FC<{
  label: string;
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "date";
  disabled?: boolean;
}> = ({ label, value, name, onChange, type = "text", disabled }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-text-secondary"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="mt-1 w-full bg-background border border-border rounded-md py-1.5 px-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:bg-gray-200 disabled:cursor-not-allowed"
    />
  </div>
);

const DetailRow: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}> = ({ label, name, value, onChange, disabled }) => (
  <tr className="hover:bg-gray-50">
    <td className="p-3 text-sm text-text-main">{label}</td>
    <td className="p-3 w-56">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-background border border-border rounded-md py-1.5 px-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:bg-gray-200 disabled:cursor-not-allowed"
        aria-label={`Avaliação para ${label}`}
      >
        {evaluationOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </td>
  </tr>
);

interface RiskAssessmentProps extends ModuleChangeProps {
  initialView?: "history" | "form";
  selectedId?: string;
  setIsFormDirty?: (isDirty: boolean) => void;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  onModuleChange,
  setIsFormDirty,
  initialView,
  selectedId,
}) => {
  const [view, setView] = useState<"history" | "form">(
    initialView || "history",
  );
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    selectedId || "1",
  );
  const selectedEntity = useMemo(
    () => mockEntities.find((e) => e.id === selectedEntityId)!,
    [selectedEntityId],
  );

  const [nameQuery, setNameQuery] = useState("");
  const [nifQuery, setNifQuery] = useState("");

  const [nameSearchResults, setNameSearchResults] = useState<Entity[]>([]);
  const [nifSearchResults, setNifSearchResults] = useState<Entity[]>([]);
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [isNifDropdownOpen, setIsNifDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const pristineState = useRef<string | null>(null);

  const [serviceType, setServiceType] = useState("");
  const [startDate, setStartDate] = useState("2025-10-20");
  const [endDate, setEndDate] = useState("2025-11-20");

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [historySearch, setHistorySearch] = useState("");
  const [historyClassificationFilter, setHistoryClassificationFilter] =
    useState("all");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);

  const [isAddEntityModalOpen, setIsAddEntityModalOpen] = useState(false);

  const infoNeededRequest = useMemo(() => {
    if (!selectedEntity) return null;
    return mockApprovalQueue.find(
      (item) =>
        item.entityId === selectedEntity.id &&
        item.status === "Mais Informação Necessária",
    );
  }, [selectedEntity]);

  const pendingIssues = useMemo(() => {
    if (!selectedEntity) return [];
    const issues: string[] = [];
    const entityType = selectedEntity.entityType;

    if (!selectedEntity.name?.trim())
      issues.push("O Nome da entidade está em falta.");
    if (!selectedEntity.nif?.trim())
      issues.push("O NIF da entidade está em falta.");
    if (!selectedEntity.address?.trim())
      issues.push("O Endereço da entidade está em falta.");

    if (
      entityType === EntityType.PrivateCompany ||
      entityType === EntityType.NGO
    ) {
      if (
        !selectedEntity.beneficialOwner?.trim() ||
        selectedEntity.beneficialOwner === "N/A"
      ) {
        issues.push(
          "O Beneficiário Efetivo (UBO) não foi identificado ou está como N/A.",
        );
      }
    }

    if (entityType === EntityType.PublicEntity) {
      if (
        !selectedEntity.isRepresentativeFormallyAppointed ||
        selectedEntity.isRepresentativeFormallyAppointed.toLowerCase() !== "sim"
      ) {
        issues.push("O Representante não possui nomeação oficial válida.");
      }
    }

    if (selectedEntity.documents?.some((d) => d.status === "Expirado")) {
      issues.push("Existem documentos expirados que impedem a conformidade.");
    }

    if (infoNeededRequest) {
      issues.push(`Ação pendente do tipo "Mais Informação Necessária".`);
    }

    return issues;
  }, [selectedEntity, infoNeededRequest]);

  const hasBlockingIssues = pendingIssues.length > 0;

  useEffect(() => {
    if (selectedEntity) {
      setNameQuery(selectedEntity.name);
      setNifQuery(selectedEntity.nif);

      const initialServiceType = selectedEntity.services.join(", ");
      const initialStartDate = "2025-10-20";
      const initialEndDate = "2025-11-20";
      const initialObservacoes = "";

      setServiceType(initialServiceType);
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setObservacoes(initialObservacoes);

      const initialQuestionsState: Record<string, string> = {};
      const currentCriteria = criteriaMatrix[selectedEntity.entityType];
      if (currentCriteria) {
        for (const key in currentCriteria) {
          const criterion = currentCriteria[key];
          for (const itemKey of Object.keys(criterion.items)) {
            initialQuestionsState[itemKey] = "D - Pendente";
          }
        }
      }
      setFormState(initialQuestionsState);

      pristineState.current = JSON.stringify({
        formState: initialQuestionsState,
        observacoes: initialObservacoes,
        serviceType: initialServiceType,
        startDate: initialStartDate,
        endDate: initialEndDate,
      });

      if (setIsFormDirty) {
        setIsFormDirty(false);
      }
    }
  }, [selectedEntityId, selectedEntity, setIsFormDirty]);

  useEffect(() => {
    if (!pristineState.current || !setIsFormDirty) {
      return;
    }

    const currentState = JSON.stringify({
      formState,
      observacoes,
      serviceType,
      startDate,
      endDate,
    });

    setIsFormDirty(currentState !== pristineState.current);
  }, [formState, observacoes, serviceType, startDate, endDate, setIsFormDirty]);

  useEffect(() => {
    return () => {
      if (setIsFormDirty) {
        setIsFormDirty(false);
      }
    };
  }, [setIsFormDirty]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsNameDropdownOpen(false);
        setIsNifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculatedScores = useMemo(() => {
    const scores: Record<string, number> = {};
    let finalScore = 0;
    const currentMatrix = criteriaMatrix[selectedEntity.entityType];

    if (!currentMatrix) {
      return {
        scores: {},
        finalScore: 0,
        finalClassification: "C - Não Favorável",
      };
    }

    for (const criterionKey in currentMatrix) {
      const criterion = currentMatrix[criterionKey];
      const questionKeys = Object.keys(criterion.items);
      if (questionKeys.length === 0) continue;

      const totalScore = questionKeys.reduce(
        (acc, key) => acc + (scoreMap[formState[key]] || 0),
        0,
      );
      const averageScore = totalScore / questionKeys.length;
      scores[criterionKey] = averageScore;
      finalScore += (averageScore / 5) * criterion.weight;
    }

    const finalScorePercentage = finalScore * 100;

    let finalClassification: keyof typeof classificationConfig =
      "C - Não Favorável";
    if (finalScorePercentage >= 80) {
      finalClassification = "A - Favorável";
    } else if (finalScorePercentage >= 60) {
      finalClassification = "B - Favorável com Ressalvas";
    }

    return { scores, finalScore: finalScorePercentage, finalClassification };
  }, [formState, selectedEntity.entityType]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = item.entityName
        .toLowerCase()
        .includes(historySearch.toLowerCase());
      const matchesClassification =
        historyClassificationFilter === "all" ||
        item.classification === historyClassificationFilter;
      return matchesSearch && matchesClassification;
    });
  }, [historySearch, historyClassificationFilter, history]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNameQuery(query);
    if (query.trim() === "") {
      setNameSearchResults([]);
      setIsNameDropdownOpen(false);
    } else {
      const results = mockEntities.filter((entity) =>
        entity.name.toLowerCase().includes(query.toLowerCase()),
      );
      setNameSearchResults(results);
      setIsNameDropdownOpen(true);
      setIsNifDropdownOpen(false);
    }
  };

  const handleNifSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNifQuery(query);
    if (query.trim() === "") {
      setNifSearchResults([]);
      setIsNifDropdownOpen(false);
    } else {
      const results = mockEntities.filter((entity) =>
        entity.nif.includes(query),
      );
      setNifSearchResults(results);
      setIsNifDropdownOpen(true);
      setIsNameDropdownOpen(false);
    }
  };

  const handleSelectEntity = (entity: Entity) => {
    setSelectedEntityId(entity.id);
    setNameQuery(entity.name);
    setNifQuery(entity.nif);
    setIsNameDropdownOpen(false);
    setIsNifDropdownOpen(false);
  };

  const handleSaveNewEntity = (newEntity: Entity) => {
    mockEntities.unshift(newEntity);
    addToast(`Entidade "${newEntity.name}" adicionada com sucesso!`, "success");
    setIsAddEntityModalOpen(false);
    handleSelectEntity(newEntity);
  };

  const getInitialValueForModal = () => {
    if (isNameDropdownOpen) return { name: nameQuery, nif: "" };
    if (isNifDropdownOpen) return { name: "", nif: nifQuery };
    return { name: nameQuery, nif: nifQuery };
  };

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    setObservacoes("Processando análise (IA ou Motor Heurístico)...");
    const payload = {
      generalInfo: {
        nif: selectedEntity.nif,
        name: selectedEntity.name,
        address: selectedEntity.address,
        serviceType: serviceType,
        entityType: selectedEntity.entityType,
      },
      criteriaMatrix: criteriaMatrix[selectedEntity.entityType],
      formState: formState,
      finalScore: calculatedScores.finalScore,
      finalClassification: calculatedScores.finalClassification,
    };
    try {
      const summary = await generateSupplierEvaluationSummary(payload);
      setObservacoes(summary);
    } catch (e) {
      setObservacoes("Ocorreu um erro ao processar a análise.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setIsHistoryModalOpen(true);
  };

  const handleEditHistoryItem = (item: HistoryItem) => {
    const entity = mockEntities.find((e) => e.name === item.entityName);
    if (entity) {
      setSelectedEntityId(entity.id);
      setFormState(item.formState);
      setObservacoes(item.observations);
      setView("form");
      addToast(
        `Avaliação de "${item.entityName}" carregada para edição.`,
        "info",
      );
    } else {
      addToast(
        "Entidade original não encontrada para esta avaliação.",
        "error",
      );
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    if (
      window.confirm(
        "Tem a certeza que deseja apagar este registo de avaliação do histórico?",
      )
    ) {
      const newHistory = history.filter((item) => item.id !== id);
      setHistory(newHistory);
      // Sync with mock
      const mockIdx = mockHistory.findIndex((m) => m.id === id);
      if (mockIdx > -1) mockHistory.splice(mockIdx, 1);
      addToast("Avaliação removida do histórico.", "success");
    }
  };

  const handleBackToHistory = () => {
    if (setIsFormDirty && onModuleChange) {
      setIsFormDirty(false);
      setTimeout(() => {
        setView("history");
      }, 0);
    }
  };

  const handleSaveAssessment = () => {
    const newId = `h${history.length + 1}`;
    const newSequenceNumber = `AVR-${new Date().getFullYear()}-00${history.length + 1}`;

    const newAssessment: HistoryItem = {
      id: newId,
      sequenceNumber: newSequenceNumber,
      entityName: selectedEntity.name,
      assessmentDate: new Date().toISOString().split("T")[0],
      finalScore: calculatedScores.finalScore,
      classification: calculatedScores.finalClassification,
      user: "Utilizador Atual",
      formState: formState,
      observations: observacoes,
    };
    setHistory((prevHistory) => [newAssessment, ...prevHistory]);
    mockHistory.unshift(newAssessment);

    const newApprovalId = `aq${mockApprovalQueue.length + 1}`;
    const newApprovalRequest: ApprovalQueueItem = {
      id: newApprovalId,
      entityId: selectedEntity.id,
      entityName: selectedEntity.name,
      requestType: "Avaliação de Risco",
      requester: "Utilizador Atual",
      requestDate: new Date().toISOString().split("T")[0],
      status: "Aguardando Revisão de Compliance",
      log: [
        {
          step: "Submissão",
          user: "Utilizador Atual",
          date: new Date().toISOString().split("T")[0],
          action: "Submetido",
          comments: "Avaliação de risco inicial submetida.",
        },
      ],
    };
    mockApprovalQueue.unshift(newApprovalRequest);

    if (setIsFormDirty) setIsFormDirty(false);
    addToast("Avaliação salva e submetida!", "success");
    if (onModuleChange) onModuleChange("risk-assessment");
  };

  const renderDetailSection = (
    criterionKey: string,
    criterionData: {
      name?: string;
      weight: number;
      items: Record<string, string>;
    },
  ) => {
    const itemsToRender = Object.entries(criterionData.items);
    if (itemsToRender.length === 0) return null;

    return (
      <div key={criterionKey}>
        <h3 className="text-lg font-semibold text-primary mb-3">
          {criterionKey}
        </h3>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-border">
              {itemsToRender.map(([key, label]) => (
                <DetailRow
                  key={key}
                  label={label}
                  name={key}
                  value={formState[key] || "D - Pendente"}
                  onChange={handleSelectChange}
                  disabled={false} // Mantém os campos editáveis para simulação pro-forma
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <HistoryDetailModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        item={selectedHistoryItem}
      />
      <AddEntityModal
        isOpen={isAddEntityModalOpen}
        onClose={() => setIsAddEntityModalOpen(false)}
        onSave={handleSaveNewEntity}
        initialName={getInitialValueForModal().name}
        initialNif={getInitialValueForModal().nif}
      />

      {view === "history" && (
        <div className="bg-card p-6 rounded-xl shadow-md space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Avaliações de Risco
              </h1>
              <p className="text-text-secondary mt-1">
                Consulte o histórico ou inicie uma nova avaliação.
              </p>
            </div>
            <button
              onClick={() => setView("form")}
              className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg transition-colors mt-4 sm:mt-0"
            >
              Nova Avaliação
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Pesquisar entidade..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full md:w-1/3 bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
            />
            <select
              value={historyClassificationFilter}
              onChange={(e) => setHistoryClassificationFilter(e.target.value)}
              className="w-full md:w-auto bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
            >
              <option value="all">Todas as Classificações</option>
              {Object.keys(classificationConfig).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text-secondary">
              <thead className="text-xs text-text-main uppercase bg-background">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Nº Avaliação
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Entidade
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pontuação
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Classificação
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Avaliador
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-text-main">
                      {item.sequenceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-main">
                      {item.entityName}
                    </td>
                    <td className="px-6 py-4">{item.assessmentDate}</td>
                    <td className="px-6 py-4 font-semibold">
                      {item.finalScore.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationConfig[item.classification as keyof typeof classificationConfig]?.badge}`}
                      >
                        {item.classification}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.user}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-text-secondary hover:text-primary transition-colors"
                          title="Ver Detalhes"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditHistoryItem(item)}
                          className="text-text-secondary hover:text-warning transition-colors"
                          title="Editar Avaliação"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="text-text-secondary hover:text-danger transition-colors"
                          title="Apagar Avaliação"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">
                Nova Avaliação de Risco
              </h1>
              <button
                onClick={() => onModuleChange("new-entity", selectedEntity)}
                className="flex items-center gap-2 text-sm bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg transition-all"
                title="Editar dados cadastrais da entidade"
              >
                <EditIcon className="w-4 h-4" />
                <span>Editar Cadastro</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleBackToHistory}
                className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {" "}
                &larr; Voltar{" "}
              </button>
              <button
                onClick={() =>
                  onModuleChange("menu-dashboard", undefined, true)
                }
                className="bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {" "}
                Sair{" "}
              </button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md border-t-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-primary">
                Informações Gerais
              </h2>
            </div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"
              ref={searchContainerRef}
            >
              <div className="relative md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-text-secondary">
                  Nome da Entidade
                </label>
                <input
                  type="text"
                  value={nameQuery}
                  onChange={handleNameSearch}
                  onFocus={handleNameSearch}
                  className="mt-1 w-full bg-background border border-border rounded-md py-1.5 px-2 text-sm text-text-main focus:ring-2 focus:ring-secondary outline-none"
                />
                {isNameDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {nameSearchResults.map((entity) => (
                      <li
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity)}
                        className="cursor-pointer p-2 text-sm hover:bg-secondary hover:text-primary"
                      >
                        {entity.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <InfoItem label="NIF" value={selectedEntity.nif} />
              <InfoItem label="Tipo" value={selectedEntity.entityType} />
              <div className="md:col-span-3">
                <InfoItem label="Endereço" value={selectedEntity.address} />
              </div>
              <EditableInfoItem
                label="Tipo de Serviço"
                name="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                disabled={false}
              />
              <EditableInfoItem
                label="Data Início"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={false}
              />
              <EditableInfoItem
                label="Data Fim"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={false}
              />
            </div>
          </div>

          {hasBlockingIssues && (
            <div className="bg-danger/5 border-l-4 border-danger p-6 rounded-r-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4">
                <WarningIcon className="w-8 h-8 text-danger shrink-0" />
                <div>
                  <p className="font-bold text-red-800 text-lg">
                    Avaliação Bloqueada: Pendências Encontradas
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-red-700 space-y-1">
                    {pendingIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => onModuleChange("new-entity", selectedEntity)}
                className="bg-danger text-white px-6 py-2 rounded-lg font-bold hover:bg-danger-hover transition-colors shadow-md shrink-0 flex items-center gap-2"
              >
                <EditIcon className="w-5 h-5" />
                Resolver Pendências Agora
              </button>
            </div>
          )}

          <div className="space-y-6">
            {Object.keys(criteriaMatrix[selectedEntity.entityType] || {}).map(
              (criterionKey) =>
                renderDetailSection(
                  criterionKey,
                  criteriaMatrix[selectedEntity.entityType][criterionKey],
                ),
            )}
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Relatório de Análise Prospectiva
            </h2>
            <textarea
              className="w-full h-48 p-3 bg-background border border-border rounded-lg text-text-secondary text-sm focus:ring-2 focus:ring-secondary outline-none transition disabled:bg-gray-200"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="A análise detalhada aparecerá aqui após o processamento. Você pode processar uma análise temporária para verificar o resultado."
              disabled={false}
            />
            <div className="text-right">
              <p className="text-xs text-text-secondary uppercase">
                Resultado Estimado
              </p>
              <p
                className={`text-xl font-bold ${classificationConfig[calculatedScores.finalClassification].color.replace("text-", "text-")}`}
              >
                {calculatedScores.finalScore.toFixed(1)}% -{" "}
                {calculatedScores.finalClassification}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              onClick={handleGenerateAISummary}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:bg-gray-400"
            >
              {isGenerating && <span className="animate-spin">🌀</span>}
              {isGenerating ? "Analisando..." : "Processar Análise Pro-forma"}
            </button>
            <button
              onClick={handleSaveAssessment}
              disabled={hasBlockingIssues}
              className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all ${hasBlockingIssues ? "bg-gray-400 cursor-not-allowed" : "bg-success hover:bg-green-600"}`}
            >
              Salvar e Submeter para Aprovação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
