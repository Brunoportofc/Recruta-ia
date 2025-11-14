import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthYearPickerProps {
  value?: string // formato "YYYY-MM"
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  maxDate?: Date // Data máxima permitida
}

export function MonthYearPicker({
  value,
  onChange,
  disabled,
  placeholder = "Selecione o mês e ano",
  maxDate = new Date() // Por padrão, não permite datas futuras
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Converte string "YYYY-MM" para Date
  const dateValue = value ? new Date(value + "-01") : undefined
  
  // Estado local para mês e ano selecionados
  const [selectedMonth, setSelectedMonth] = React.useState(
    dateValue ? dateValue.getMonth() : new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = React.useState(
    dateValue ? dateValue.getFullYear() : new Date().getFullYear()
  )

  // Atualiza estados quando o valor externo muda
  React.useEffect(() => {
    if (value) {
      const date = new Date(value + "-01")
      setSelectedMonth(date.getMonth())
      setSelectedYear(date.getFullYear())
    }
  }, [value])

  // Gera array de anos (dos últimos 50 anos até o ano atual)
  const currentYear = maxDate.getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  // Meses
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const handleConfirm = () => {
    // Verifica se a data selecionada não é futura
    const selectedDate = new Date(selectedYear, selectedMonth, 1)
    if (selectedDate > maxDate) {
      // Se for futura, ajusta para a data máxima permitida
      const maxYear = maxDate.getFullYear()
      const maxMonth = maxDate.getMonth()
      const formattedDate = `${maxYear}-${String(maxMonth + 1).padStart(2, '0')}`
      onChange(formattedDate)
    } else {
      const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
      onChange(formattedDate)
    }
    setIsOpen(false)
  }

  const displayValue = dateValue 
    ? format(dateValue, "MMMM 'de' yyyy", { locale: ptBR })
    : undefined

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mês</label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(val) => setSelectedMonth(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => {
                  // Desabilita meses futuros se o ano selecionado for o ano atual
                  const isDisabled = selectedYear === maxDate.getFullYear() && index > maxDate.getMonth()
                  return (
                    <SelectItem 
                      key={index} 
                      value={index.toString()}
                      disabled={isDisabled}
                    >
                      {month}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(val) => setSelectedYear(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleConfirm} className="w-full">
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

