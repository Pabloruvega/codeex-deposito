'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FaltantesObraTab } from './FaltantesObraTab'
import { FaltantesProveedorTab } from './FaltantesProveedorTab'

export function FaltantesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Faltantes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Materiales faltantes de obra y diferencias con proveedor
        </p>
      </div>

      <Tabs defaultValue="obra">
        <TabsList>
          <TabsTrigger value="obra">De obra</TabsTrigger>
          <TabsTrigger value="proveedor">De proveedor</TabsTrigger>
        </TabsList>

        <TabsContent value="obra">
          <FaltantesObraTab />
        </TabsContent>

        <TabsContent value="proveedor">
          <FaltantesProveedorTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
