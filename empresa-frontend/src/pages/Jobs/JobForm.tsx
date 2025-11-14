import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(isEditing);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const tabs = ["basic", "config"] as const;
  const [currentTab, setCurrentTab] = useState<typeof tabs[number]>("basic");
  const [formData, setFormData] = useState({
    job_title: { text: "" },
    company: { text: "" },
    workplace: "" as "ON_SITE" | "HYBRID" | "REMOTE" | "",
    location: { text: "" }, // Formato Unipile: { text: "São Paulo - SP" } ou { id: "103119278" }
    description: "",
    employment_status: "" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "OTHER" | "VOLUNTEER" | "INTERNSHIP" | "",
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
      amount: "" as string,
      min: "" as string,
      max: "" as string,
    },
    salary_anonymous: false,
  });


  // Carregar dados da vaga ao editar
  useEffect(() => {
    const loadJobData = async () => {
      if (!isEditing || !id) return;

      try {
        console.log('📝 [EDIT] Carregando dados da vaga:', id);
        const response = await fetch(`http://localhost:3001/jobs/${id}`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar vaga');
        }

        const data = await response.json();
        console.log('✅ [EDIT] Vaga carregada:', data);

        // Mapear dados da API para o formato do formulário
        setFormData({
          job_title: { text: data.jobTitle || "" },
          company: { text: data.company || "" },
          workplace: data.workplace || "",
          location: typeof data.location === 'object' && data.location 
            ? data.location 
            : { text: data.location || "" },
          description: data.description || "",
          employment_status: data.employmentStatus || "",
          job_config: data.jobConfig || {
            tests: { test1: false, test2: false, test3: false, test4: false },
            interviews_count: 1,
            active_days: 30,
          },
          salary: {
            mode: "single",
            amount: data.salaryAmount 
              ? data.salaryAmount.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : "",
            min: "",
            max: "",
          },
          salary_anonymous: data.salaryAnonymous || false,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('❌ [EDIT] Erro ao carregar vaga:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da vaga",
          variant: "destructive"
        });
        navigate('/vagas');
      }
    };

    loadJobData();
  }, [id, isEditing, navigate, toast]);

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
        job_config: {
          tests: formData.job_config.tests,
          interviews_count: formData.job_config.interviews_count,
          active_days: formData.job_config.active_days,
        },
        status: "rascunho",
        ...(formData.salary_anonymous
          ? { salary_anonymous: true }
          : formData.salary.amount !== ""
          ? { 
              salary_amount: parseFloat(
                formData.salary.amount
                  .replace(/\./g, '') // Remove pontos
                  .replace(',', '.') // Substitui vírgula por ponto
              )
            }
          : {}),
      };
      console.log("📤 Enviando payload para API:", payload);

      const url = isEditing 
        ? `http://localhost:3001/jobs/${id}`
        : 'http://localhost:3001/jobs';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || `Erro ao ${isEditing ? 'atualizar' : 'criar'} vaga`);
      }

      console.log(`✅ Vaga ${isEditing ? 'atualizada' : 'criada'} com sucesso:`, result);

      toast({
        title: isEditing ? "✅ Vaga atualizada!" : "✅ Vaga criada como rascunho!",
        description: result.message || `A vaga foi ${isEditing ? 'atualizada' : 'criada como rascunho'}.`,
        variant: "default",
      });

      const jobId = isEditing ? id : (result.id ?? result.data?.id ?? result.job?.id);
      setTimeout(() => {
        if (jobId) {
          navigate(`/vagas/${jobId}`, { state: { status: 'rascunho' } });
        } else {
          navigate('/vagas');
        }
      }, 800);

    } catch (error) {
      console.error(`❌ Erro ao ${isEditing ? 'atualizar' : 'criar'} vaga:`, error);
      toast({
        title: `❌ Erro ao ${isEditing ? 'atualizar' : 'criar'} vaga`,
        description: error instanceof Error ? error.message : `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'publicar'} a vaga. Tente novamente.`,
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
  

  // Loading state quando estiver carregando dados da vaga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando dados da vaga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vagas")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "Editar Vaga" : "Nova Vaga"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize as informações da vaga" : "Preencha os dados para criar uma nova vaga"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
            </TabsList>

          {/* Informações Básicas */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas da Vaga</CardTitle>
                <CardDescription>Preencha os campos obrigatórios para criar a vaga</CardDescription>
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
                    <Input
                      id="location"
                      placeholder="Ex: São Paulo - SP, Ribeirão Preto - SP, etc."
                      value={formData.location.text || ""}
                      onChange={(e) => handleChange("location", { text: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite a cidade onde a vaga está localizada
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a vaga, responsabilidades e requisitos..."
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
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="salary">Salário</Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="salary_anonymous" className="text-sm font-normal cursor-pointer">
                          Salário anônimo
                        </Label>
                        <Switch
                          id="salary_anonymous"
                          checked={formData.salary_anonymous}
                          onCheckedChange={(checked) => {
                            handleChange("salary_anonymous", checked);
                            if (checked) {
                              handleChange("salary.amount", "");
                            }
                          }}
                        />
                      </div>
                    </div>

                    {formData.salary_anonymous ? (
                      <div className="p-4 border rounded-md bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          💼 O salário será exibido como <strong>"A combinar"</strong> na vaga.
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-3 top-[10px] text-muted-foreground font-medium">
                          R$
                        </span>
                        <Input
                          id="salary_amount"
                          type="text"
                          placeholder="8.000,00"
                          value={formData.salary.amount}
                          onChange={(e) => {
                            // Remove tudo que não for número
                            const numbers = e.target.value.replace(/\D/g, '');
                            
                            // Converte para formato com vírgula
                            if (numbers) {
                              const value = parseInt(numbers) / 100;
                              const formatted = value.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              });
                              handleChange("salary.amount", formatted);
                            } else {
                              handleChange("salary.amount", "");
                            }
                          }}
                          className="pl-11"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Digite o valor do salário mensal
                        </p>
                      </div>
                    )}
                  </div>
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
