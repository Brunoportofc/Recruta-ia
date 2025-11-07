import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ScreeningQuestion {
  question: string;
  position?: number;
  must_match: boolean;
  answer_type: "numeric" | "multiple_choices";
  // Para numeric
  min_expectation?: number;
  max_expectation?: number;
  // Para multiple_choices
  choices?: string[];
  expected_choices?: string[];
}

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    // Campos obrigatórios
    job_title: { text: "" },
    company: { text: "" },
    workplace: "" as "ON_SITE" | "HYBRID" | "REMOTE" | "",
    location: "",
    description: "",
    
    // Campos opcionais
    employment_status: "" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "OTHER" | "VOLUNTEER" | "INTERNSHIP" | "",
    auto_rejection_template: "",
    
    // Recruiter (obrigatório)
    recruiter: {
      project: { name: "" },
      functions: [] as string[],
      industries: [] as string[],
      seniority: "" as "INTERNSHIP" | "ENTRY_LEVEL" | "ASSOCIATE" | "MID_SENIOR_LEVEL" | "DIRECTOR" | "EXECUTIVE" | "NOT_APPLICABLE" | "",
      apply_method: {
        type: "linkedin" as "linkedin" | "external",
        notification_email: "",
        resume_required: true,
        url: "",
      },
      include_poster_info: true,
      tracking_pixel_url: "",
      company_job_id: "",
      auto_archive_applicants: {
        screening_questions: true,
        outside_of_country: true,
      },
      send_rejection_notification: true,
    },
    
    screening_questions: [] as ScreeningQuestion[],
  });

  const [newQuestion, setNewQuestion] = useState<ScreeningQuestion>({
    question: "",
    must_match: false,
    answer_type: "multiple_choices",
    choices: [],
    expected_choices: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados para API (account_id virá do backend)
    const payload = {
      job_title: formData.job_title.text ? { text: formData.job_title.text } : { id: formData.job_title.text },
      company: formData.company.text ? { text: formData.company.text } : { id: formData.company.text },
      workplace: formData.workplace,
      location: formData.location,
      description: formData.description,
      ...(formData.employment_status && { employment_status: formData.employment_status }),
      ...(formData.auto_rejection_template && { auto_rejection_template: formData.auto_rejection_template }),
      ...(formData.screening_questions.length > 0 && { screening_questions: formData.screening_questions }),
      recruiter: {
        project: formData.recruiter.project.name ? { name: formData.recruiter.project.name } : { id: formData.recruiter.project.name },
        functions: formData.recruiter.functions,
        industries: formData.recruiter.industries,
        seniority: formData.recruiter.seniority,
        apply_method: formData.recruiter.apply_method.type === "linkedin"
          ? {
              type: "linkedin",
              notification_email: formData.recruiter.apply_method.notification_email,
              resume_required: formData.recruiter.apply_method.resume_required,
            }
          : {
              type: "external",
              url: formData.recruiter.apply_method.url,
            },
        include_poster_info: formData.recruiter.include_poster_info,
        ...(formData.recruiter.tracking_pixel_url && { tracking_pixel_url: formData.recruiter.tracking_pixel_url }),
        ...(formData.recruiter.company_job_id && { company_job_id: formData.recruiter.company_job_id }),
        auto_archive_applicants: formData.recruiter.auto_archive_applicants,
        send_rejection_notification: formData.recruiter.send_rejection_notification,
      },
    };

    console.log("Payload para API:", payload);
    
    // Aqui seria a chamada à API
    // await createJobPosting(payload);
    
    navigate("/vagas");
  };

  const handleChange = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (path: string, index: number, value: string) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = [...current[keys[keys.length - 1]]];
      array[index] = value;
      current[keys[keys.length - 1]] = array;
      return newData;
    });
  };

  const addArrayItem = (path: string, value: string = "") => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], value];
      return newData;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = [...current[keys[keys.length - 1]]];
      array.splice(index, 1);
      current[keys[keys.length - 1]] = array;
      return newData;
    });
  };

  const addScreeningQuestion = () => {
    if (!newQuestion.question) return;
    
    setFormData((prev) => ({
      ...prev,
      screening_questions: [...prev.screening_questions, { ...newQuestion }],
    }));
    
    setNewQuestion({
      question: "",
      must_match: false,
      answer_type: "multiple_choices",
      choices: [],
      expected_choices: [],
    });
  };

  const removeScreeningQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screening_questions: prev.screening_questions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vagas")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "Editar Vaga" : "Nova Vaga LinkedIn"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize as informações da vaga" : "Preencha os dados para criar uma nova vaga no LinkedIn"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="recruiter">Recrutamento</TabsTrigger>
            <TabsTrigger value="screening">Triagem</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
            <TabsTrigger value="rejection">Rejeição</TabsTrigger>
          </TabsList>

          {/* Informações Básicas */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas da Vaga</CardTitle>
                <CardDescription>Campos obrigatórios para criar a vaga no LinkedIn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Título da Vaga *</Label>
                  <Input
                    id="job_title"
                    placeholder="Ex: Desenvolvedor Full Stack Senior"
                    value={formData.job_title.text}
                    onChange={(e) => handleChange("job_title.text", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa *</Label>
                  <Input
                    id="company"
                    placeholder="Nome da empresa"
                    value={formData.company.text}
                    onChange={(e) => handleChange("company.text", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workplace">Modalidade de Trabalho *</Label>
                    <Select
                      value={formData.workplace}
                      onValueChange={(value) => handleChange("workplace", value)}
                      required
                    >
                      <SelectTrigger id="workplace">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ON_SITE">Presencial</SelectItem>
                        <SelectItem value="HYBRID">Híbrido</SelectItem>
                        <SelectItem value="REMOTE">Remoto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleChange("location", value)}
                      required
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Selecione a localização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="103119278">São Paulo - SP</SelectItem>
                        <SelectItem value="103454366">Rio de Janeiro - RJ</SelectItem>
                        <SelectItem value="103323681">Belo Horizonte - MG</SelectItem>
                        <SelectItem value="103883259">Brasília - DF</SelectItem>
                        <SelectItem value="103154980">Curitiba - PR</SelectItem>
                        <SelectItem value="103254728">Porto Alegre - RS</SelectItem>
                        <SelectItem value="103177389">Recife - PE</SelectItem>
                        <SelectItem value="103195834">Salvador - BA</SelectItem>
                        <SelectItem value="103267518">Fortaleza - CE</SelectItem>
                        <SelectItem value="103191675">Manaus - AM</SelectItem>
                        <SelectItem value="103176292">Campinas - SP</SelectItem>
                        <SelectItem value="103162431">Florianópolis - SC</SelectItem>
                        <SelectItem value="103347776">Vitória - ES</SelectItem>
                        <SelectItem value="103221083">Goiânia - GO</SelectItem>
                        <SelectItem value="103348753">Natal - RN</SelectItem>
                        <SelectItem value="103259389">João Pessoa - PB</SelectItem>
                        <SelectItem value="103267518">Aracaju - SE</SelectItem>
                        <SelectItem value="103195834">Maceió - AL</SelectItem>
                        <SelectItem value="103267518">Teresina - PI</SelectItem>
                        <SelectItem value="103191675">São Luís - MA</SelectItem>
                        <SelectItem value="103176292">Belém - PA</SelectItem>
                        <SelectItem value="103162431">Macapá - AP</SelectItem>
                        <SelectItem value="103347776">Boa Vista - RR</SelectItem>
                        <SelectItem value="103221083">Rio Branco - AC</SelectItem>
                        <SelectItem value="103348753">Palmas - TO</SelectItem>
                        <SelectItem value="103259389">Cuiabá - MT</SelectItem>
                        <SelectItem value="103267518">Campo Grande - MS</SelectItem>
                        <SelectItem value="103195834">Porto Velho - RO</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      A localização será convertida para o ID correto no backend
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a vaga, responsabilidades e requisitos. Você pode usar HTML tags."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_status">Status de Emprego</Label>
                  <Select
                    value={formData.employment_status}
                    onValueChange={(value) => handleChange("employment_status", value)}
                  >
                    <SelectTrigger id="employment_status">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Tempo Integral</SelectItem>
                      <SelectItem value="PART_TIME">Meio Período</SelectItem>
                      <SelectItem value="CONTRACT">Contrato</SelectItem>
                      <SelectItem value="TEMPORARY">Temporário</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                      <SelectItem value="VOLUNTEER">Voluntário</SelectItem>
                      <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Recrutamento */}
          <TabsContent value="recruiter" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Recrutamento</CardTitle>
                <CardDescription>Informações sobre o recrutador e projeto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="project_name">Nome do Projeto *</Label>
                  <Input
                    id="project_name"
                    placeholder="Nome do projeto"
                    value={formData.recruiter.project.name}
                    onChange={(e) => handleChange("recruiter.project.name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Funções (Job Functions) *</Label>
                  <p className="text-xs text-muted-foreground mb-2">Selecione 1 a 3 funções (use IDs, ex: "engineering")</p>
                  {formData.recruiter.functions.map((func, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder={`Função ${index + 1}`}
                        value={func}
                        onChange={(e) => handleArrayChange("recruiter.functions", index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("recruiter.functions", index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.recruiter.functions.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("recruiter.functions")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Função
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Indústrias *</Label>
                  <p className="text-xs text-muted-foreground mb-2">Selecione 1 a 3 indústrias (use IDs numéricos)</p>
                  {formData.recruiter.industries.map((industry, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder={`Indústria ${index + 1} (ID)`}
                        value={industry}
                        onChange={(e) => handleArrayChange("recruiter.industries", index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("recruiter.industries", index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.recruiter.industries.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem("recruiter.industries")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Indústria
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seniority">Senioridade *</Label>
                  <Select
                    value={formData.recruiter.seniority}
                    onValueChange={(value) => handleChange("recruiter.seniority", value)}
                    required
                  >
                    <SelectTrigger id="seniority">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNSHIP">Estágio</SelectItem>
                      <SelectItem value="ENTRY_LEVEL">Iniciante</SelectItem>
                      <SelectItem value="ASSOCIATE">Associado</SelectItem>
                      <SelectItem value="MID_SENIOR_LEVEL">Pleno/Sênior</SelectItem>
                      <SelectItem value="DIRECTOR">Diretor</SelectItem>
                      <SelectItem value="EXECUTIVE">Executivo</SelectItem>
                      <SelectItem value="NOT_APPLICABLE">Não Aplicável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Método de Candidatura *</Label>
                  
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.recruiter.apply_method.type}
                      onValueChange={(value) => handleChange("recruiter.apply_method.type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">Dentro do LinkedIn</SelectItem>
                        <SelectItem value="external">Site Externo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.recruiter.apply_method.type === "linkedin" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="notification_email">E-mail de Notificação *</Label>
                        <Input
                          id="notification_email"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={formData.recruiter.apply_method.notification_email}
                          onChange={(e) => handleChange("recruiter.apply_method.notification_email", e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="resume_required"
                          checked={formData.recruiter.apply_method.resume_required}
                          onCheckedChange={(checked) => handleChange("recruiter.apply_method.resume_required", checked)}
                        />
                        <Label htmlFor="resume_required">Currículo Obrigatório</Label>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="external_url">URL Externa *</Label>
                      <Input
                        id="external_url"
                        type="url"
                        placeholder="https://exemplo.com/candidaturas"
                        value={formData.recruiter.apply_method.url}
                        onChange={(e) => handleChange("recruiter.apply_method.url", e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include_poster_info"
                      checked={formData.recruiter.include_poster_info}
                      onCheckedChange={(checked) => handleChange("recruiter.include_poster_info", checked)}
                    />
                    <Label htmlFor="include_poster_info">Mostrar informações do recrutador no post</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tracking_pixel_url">URL de Pixel de Rastreamento</Label>
                    <Input
                      id="tracking_pixel_url"
                      type="url"
                      placeholder="https://exemplo.com/pixel"
                      value={formData.recruiter.tracking_pixel_url}
                      onChange={(e) => handleChange("recruiter.tracking_pixel_url", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_job_id">ID da Vaga na Empresa</Label>
                    <Input
                      id="company_job_id"
                      placeholder="ID interno da empresa"
                      value={formData.recruiter.company_job_id}
                      onChange={(e) => handleChange("recruiter.company_job_id", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perguntas de Triagem */}
          <TabsContent value="screening" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas de Triagem</CardTitle>
                <CardDescription>Adicione perguntas para filtrar candidatos automaticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.screening_questions.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium">Pergunta {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScreeningQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pergunta</Label>
                        <Input value={question.question} readOnly />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>Exigir correspondência exata</Label>
                        <Switch checked={question.must_match} disabled />
                      </div>
                      {question.answer_type === "numeric" && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Valor Mínimo</Label>
                            <Input type="number" value={question.min_expectation} readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor Máximo</Label>
                            <Input type="number" value={question.max_expectation} readOnly />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                <Separator />

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-4">Adicionar Nova Pergunta</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pergunta *</Label>
                      <Input
                        placeholder="Ex: Quantos anos de experiência você tem?"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Resposta *</Label>
                      <Select
                        value={newQuestion.answer_type}
                        onValueChange={(value) => setNewQuestion({ ...newQuestion, answer_type: value as "numeric" | "multiple_choices" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numeric">Numérica</SelectItem>
                          <SelectItem value="multiple_choices">Múltipla Escolha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newQuestion.answer_type === "numeric" ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Valor Mínimo</Label>
                          <Input
                            type="number"
                            value={newQuestion.min_expectation || ""}
                            onChange={(e) => setNewQuestion({ ...newQuestion, min_expectation: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Máximo</Label>
                          <Input
                            type="number"
                            value={newQuestion.max_expectation || ""}
                            onChange={(e) => setNewQuestion({ ...newQuestion, max_expectation: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Opções de Resposta</Label>
                        <p className="text-xs text-muted-foreground mb-2">Adicione as opções disponíveis</p>
                        {newQuestion.choices?.map((choice, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input
                              value={choice}
                              onChange={(e) => {
                                const newChoices = [...(newQuestion.choices || [])];
                                newChoices[idx] = e.target.value;
                                setNewQuestion({ ...newQuestion, choices: newChoices });
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const newChoices = [...(newQuestion.choices || [])];
                                newChoices.splice(idx, 1);
                                setNewQuestion({ ...newQuestion, choices: newChoices });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewQuestion({ ...newQuestion, choices: [...(newQuestion.choices || []), ""] })}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Opção
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newQuestion.must_match}
                        onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, must_match: checked })}
                      />
                      <Label>Exigir correspondência exata</Label>
                    </div>

                    <Button type="button" onClick={addScreeningQuestion} disabled={!newQuestion.question}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Pergunta
                    </Button>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Avançadas */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>Arquivamento automático de candidatos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Arquivar automaticamente candidatos que não atendem perguntas obrigatórias</Label>
                      <p className="text-sm text-muted-foreground">
                        Candidatos que não respondem corretamente às perguntas marcadas como obrigatórias serão arquivados automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={formData.recruiter.auto_archive_applicants.screening_questions}
                      onCheckedChange={(checked) =>
                        handleChange("recruiter.auto_archive_applicants.screening_questions", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Arquivar automaticamente candidatos fora do país</Label>
                      <p className="text-sm text-muted-foreground">
                        Candidatos que estão fora do país da vaga serão arquivados automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={formData.recruiter.auto_archive_applicants.outside_of_country}
                      onCheckedChange={(checked) =>
                        handleChange("recruiter.auto_archive_applicants.outside_of_country", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enviar notificação de rejeição</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificações automáticas para candidatos rejeitados
                      </p>
                    </div>
                    <Switch
                      checked={formData.recruiter.send_rejection_notification}
                      onCheckedChange={(checked) => handleChange("recruiter.send_rejection_notification", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template de Rejeição */}
          <TabsContent value="rejection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template de Rejeição Automática</CardTitle>
                <CardDescription>
                  Defina uma mensagem que será enviada automaticamente para candidatos que não passam nas perguntas de triagem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="auto_rejection_template">Mensagem de Rejeição</Label>
                  <Textarea
                    id="auto_rejection_template"
                    placeholder="Agradecemos seu interesse, mas infelizmente você não atende aos requisitos mínimos para esta posição..."
                    value={formData.auto_rejection_template}
                    onChange={(e) => handleChange("auto_rejection_template", e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/vagas")}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Salvar Alterações" : "Criar Vaga no LinkedIn"}
          </Button>
        </div>
      </form>
    </div>
  );
}
