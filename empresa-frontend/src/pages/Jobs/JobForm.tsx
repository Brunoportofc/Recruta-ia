import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface ScreeningQuestion {
  question: string;
  position?: number;
  must_match: boolean;
  answer_type: "numeric" | "multiple_choices";
  min_expectation?: number;
  max_expectation?: number;
  choices?: string[];
  expected_choices?: string[];
}

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const tabs = ["basic", "recruiter", "config"] as const;
  const [currentTab, setCurrentTab] = useState<typeof tabs[number]>("basic");
  const [formData, setFormData] = useState({
    job_title: { text: "" },
    company: { text: "" },
    workplace: "" as "ON_SITE" | "HYBRID" | "REMOTE" | "",
    location: "",
    description: "",
  
    employment_status: "" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "OTHER" | "VOLUNTEER" | "INTERNSHIP" | "",
    auto_rejection_template: "",
  
    recruiter: {
      project: { name: "" },
      functions: [] as string[],
      industries: [] as string[],
      seniority: "" as "INTERNSHIP" | "ENTRY_LEVEL" | "ASSOCIATE" | "MID_SENIOR_LEVEL" | "DIRECTOR" | "EXECUTIVE" | "NOT_APPLICABLE" | "",
      apply_url: "",
      include_poster_info: true,
      tracking_pixel_url: "",
      company_job_id: "",
      auto_archive_applicants: {
        screening_questions: true,
        outside_of_country: true,
      },
      send_rejection_notification: true,
    },
    job_config: {
      tests: {
        test1: false,
        test2: false,
        test3: false,
        test4: false,
      },
      interviews_count: 1, 
      active_days: 30, 
    },
    salary: {
      mode: "single" as "single" | "range",
      amount: "" as number | string,
      min: "" as number | string,
      max: "" as number | string,
    },
    salary_anonymous: false,
    
  });


  const handleAdvance = () => {
    const nextIndex = tabs.indexOf(currentTab) + 1;
    if (nextIndex < tabs.length) {
      setCurrentTab(tabs[nextIndex]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Só submete se estiver na última aba (config)
    if (currentTab !== "config") {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        job_title: formData.job_title.text ? { text: formData.job_title.text } : { id: formData.job_title.text },
        company: formData.company.text ? { text: formData.company.text } : { id: formData.company.text },
        workplace: formData.workplace,
        location: formData.location,
        description: formData.description,
        ...(formData.employment_status && { employment_status: formData.employment_status }),
        ...(formData.auto_rejection_template && { auto_rejection_template: formData.auto_rejection_template }),
        recruiter: {
          project: formData.recruiter.project.name ? { name: formData.recruiter.project.name } : { id: formData.recruiter.project.name },
          functions: formData.recruiter.functions,
          industries: formData.recruiter.industries,
          seniority: formData.recruiter.seniority,
          apply_method: {
            type: "external",
            url: formData.recruiter.apply_url,
          },
          include_poster_info: formData.recruiter.include_poster_info,
          ...(formData.recruiter.tracking_pixel_url && { tracking_pixel_url: formData.recruiter.tracking_pixel_url }),
          ...(formData.recruiter.company_job_id && { company_job_id: formData.recruiter.company_job_id }),
          auto_archive_applicants: formData.recruiter.auto_archive_applicants,
          send_rejection_notification: formData.recruiter.send_rejection_notification,
        },
        job_config: {
          tests: formData.job_config.tests,
          interviews_count: formData.job_config.interviews_count,
          active_days: formData.job_config.active_days,
        },
        status: "rascunho",
         ...(formData.salary_anonymous
          ? { salary_anonymous: true }
          : formData.salary.mode === "range"
          ? {
              ...(formData.salary.min !== "" && { salary_min: Number(formData.salary.min) }),
              ...(formData.salary.max !== "" && { salary_max: Number(formData.salary.max) }),
            }
          : formData.salary.amount !== ""
          ? { salary_amount: Number(formData.salary.amount) }
          : {}),
      };
      console.log("📤 Enviando payload para API:", payload);

      const response = await fetch('http://localhost:3001/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Erro ao criar vaga');
      }

      console.log("✅ Vaga criada com sucesso:", result);

      toast({
        title: "✅ Vaga criada como rascunho!",
        description: result.message || "A vaga foi criada como rascunho.",
        variant: "default",
      });

      const createdId = result.id ?? result.data?.id ?? result.job?.id;
      setTimeout(() => {
        if (createdId) {
          navigate(`/vagas/${createdId}`, { state: { status: 'rascunho' } });
        } else {
          navigate('/vagas');
        }
      }, 800);

    } catch (error) {
      console.error("❌ Erro ao criar vaga:", error);
      toast({
        title: "❌ Erro ao criar vaga",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao publicar a vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="recruiter">Recrutamento</TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
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

                <div className="grid gap-4 md:grid-cols-2">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salário</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.salary.mode === "range" ? "default" : "outline"}
                        onClick={() => handleChange("salary.mode", formData.salary.mode === "range" ? "single" : "range")}
                      >
                        Range
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={formData.salary_anonymous ? "default" : "outline"}
                        onClick={() => {
                          if (!formData.salary_anonymous) {
                            handleChange("salary.amount", "");
                            handleChange("salary.min", "");
                            handleChange("salary.max", "");
                          }
                          handleChange("salary_anonymous", !formData.salary_anonymous);
                        }}
                      >
                        Anônimo
                      </Button>
                    </div>

                    <div className="mt-2">
                      {formData.salary_anonymous ? (
                        <p className="text-sm text-muted-foreground">O salário não será exibido na vaga.</p>
                      ) : formData.salary.mode === "range" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            id="salary_min"
                            type="number"
                            placeholder="Mínimo"
                            value={formData.salary.min}
                            onChange={(e) => handleChange("salary.min", e.target.value)}
                          />
                          <Input
                            id="salary_max"
                            type="number"
                            placeholder="Máximo"
                            value={formData.salary.max}
                            onChange={(e) => handleChange("salary.max", e.target.value)}
                          />
                        </div>
                      ) : (
                        <Input
                          id="salary_amount"
                          type="number"
                          placeholder="Valor"
                          value={formData.salary.amount}
                          onChange={(e) => handleChange("salary.amount", e.target.value)}
                          disabled={formData.salary_anonymous}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Recrutamento */}
          <TabsContent value="recruiter" className="space-y-6">
            {/* Seção 1: Projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Projeto</CardTitle>
                <CardDescription>Defina ou crie um novo projeto para este recrutamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project_name">Nome do Projeto *</Label>
                  <p className="text-xs text-muted-foreground">ID de um projeto existente OU nome de um novo projeto</p>
                  <Input
                    id="project_name"
                    placeholder="Ex: Campanha 2025 ou ID_existente"
                    value={formData.recruiter.project.name}
                    onChange={(e) => handleChange("recruiter.project.name", e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Funções e Indústrias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Função e Indústria</CardTitle>
                <CardDescription>Selecione até 3 funções e indústrias para categorizar a vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Funções (Job Functions) *</Label>
                  <p className="text-xs text-muted-foreground">
                    Use IDs do LinkedIn (ex: "engineering", "sales", "marketing"). Máximo 3. Use a rota "List search parameters" com type=JOB_FUNCTION para obter IDs válidos.
                  </p>
                  {formData.recruiter.functions.map((func, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Função ${index + 1} (ID)`}
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

                <Separator />

                <div className="space-y-3">
                  <Label>Indústrias *</Label>
                  <p className="text-xs text-muted-foreground">
                    Use IDs de indústrias do LinkedIn. Máximo 3. Use a rota "List search parameters" com type=INDUSTRY para obter IDs válidos.
                  </p>
                  {formData.recruiter.industries.map((industry, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Indústria ${index + 1} (ID numérico)`}
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
              </CardContent>
            </Card>

            {/* Seção 3: Senioridade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Nível de Senioridade</CardTitle>
                <CardDescription>Defina o nível esperado para as vagas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seniority">Senioridade *</Label>
                  <Select
                    value={formData.recruiter.seniority}
                    onValueChange={(value) => handleChange("recruiter.seniority", value)}
                    required
                  >
                    <SelectTrigger id="seniority">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNSHIP">🎓 Estágio</SelectItem>
                      <SelectItem value="ENTRY_LEVEL">🚀 Iniciante</SelectItem>
                      <SelectItem value="ASSOCIATE">👤 Associado</SelectItem>
                      <SelectItem value="MID_SENIOR_LEVEL">⭐ Pleno/Sênior</SelectItem>
                      <SelectItem value="DIRECTOR">🎯 Diretor</SelectItem>
                      <SelectItem value="EXECUTIVE">👔 Executivo</SelectItem>
                      <SelectItem value="NOT_APPLICABLE">❓ Não Aplicável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            
            {/* Seção 5: Rastreamento e Visibilidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">👁️ Visibilidade e Rastreamento</CardTitle>
                <CardDescription>Configure visibilidade do recrutador e rastreamento de impressões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <Label htmlFor="include_poster_info" className="cursor-pointer">Mostrar informações do recrutador no post</Label>
                  <Switch
                    id="include_poster_info"
                    checked={formData.recruiter.include_poster_info}
                    onCheckedChange={(checked) => handleChange("recruiter.include_poster_info", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="tracking_pixel_url">URL de Pixel de Rastreamento</Label>
                  <p className="text-xs text-muted-foreground">URL para rastrear impressões da vaga</p>
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
                  <p className="text-xs text-muted-foreground">ID interno da empresa para rastreamento de candidaturas</p>
                  <Input
                    id="company_job_id"
                    placeholder="ID interno da empresa"
                    value={formData.recruiter.company_job_id}
                    onChange={(e) => handleChange("recruiter.company_job_id", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

              {/* Configuração da Vaga */}
              <TabsContent value="config" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuração da Vaga</CardTitle>
                    <CardDescription>Ative testes, defina número de entrevistas e duração da vaga</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Testes</Label>
                      <p className="text-xs text-muted-foreground">Ative os testes que o candidato deverá realizar</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <Label className="mb-0">Teste 1</Label>
                            <p className="text-xs text-muted-foreground">Ex: Avaliação técnica inicial</p>
                          </div>
                          <Switch
                            checked={formData.job_config.tests.test1}
                            onCheckedChange={(checked) => handleChange('job_config.tests.test1', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <Label className="mb-0">Teste 2</Label>
                            <p className="text-xs text-muted-foreground">Ex: Teste comportamental</p>
                          </div>
                          <Switch
                            checked={formData.job_config.tests.test2}
                            onCheckedChange={(checked) => handleChange('job_config.tests.test2', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <Label className="mb-0">Teste 3</Label>
                            <p className="text-xs text-muted-foreground">Ex: Projeto prático</p>
                          </div>
                          <Switch
                            checked={formData.job_config.tests.test3}
                            onCheckedChange={(checked) => handleChange('job_config.tests.test3', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <Label className="mb-0">Teste 4</Label>
                            <p className="text-xs text-muted-foreground">Ex: Entrevista técnica ao vivo</p>
                          </div>
                          <Switch
                            checked={formData.job_config.tests.test4}
                            onCheckedChange={(checked) => handleChange('job_config.tests.test4', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Quantas entrevistas deseja agendar?</Label>
                      <p className="text-xs text-muted-foreground mb-2">Use o controle abaixo para escolher entre 1 e 20 entrevistas</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={formData.job_config.interviews_count}
                          onChange={(e) => handleChange('job_config.interviews_count', Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="w-16 text-right">
                          <span className="font-medium">{formData.job_config.interviews_count}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="active_days">Tempo que a vaga ficará ativa (dias)</Label>
                      <Input
                        id="active_days"
                        type="number"
                        min={1}
                        max={365}
                        value={formData.job_config.active_days}
                        onChange={(e) => handleChange('job_config.active_days', Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">Número de dias a partir da publicação</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* screening, advanced and rejection tabs removed - candidaturas serão por link externo */}

          {/* Abas de triagem/avançado/rejeição removidas (candidaturas via link externo) */}
        </Tabs>

        <div className="flex justify-between items-center gap-2 pt-6">
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/vagas")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            {tabs.indexOf(currentTab) > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentTab(tabs[tabs.indexOf(currentTab) - 1])}
                disabled={isSubmitting}
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentTab !== "config" ? (
              <Button 
                type="button" 
                onClick={handleAdvance}
                disabled={isSubmitting}
              >
                Avançar
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e as any)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando rascunho...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Vaga
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
