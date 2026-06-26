'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RemitosEntradaTab } from './RemitosEntradaTab'
import { RecepcionesTab } from './RecepcionesTab'

export function RecepcionesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Recepciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Remitos de entrada y recepciones de materiales de proveedor
        </p>
      </div>

      <Tabs defaultValue="remitos-entrada">
        <TabsList>
          <TabsTrigger value="remitos-entrada">Remitos de entrada</TabsTrigger>
          <TabsTrigger value="recepciones">Recepciones</TabsTrigger>
        </TabsList>

        <TabsContent value="remitos-entrada">
          <RemitosEntradaTab />
        </TabsContent>

        <TabsContent value="recepciones">
          <RecepcionesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
