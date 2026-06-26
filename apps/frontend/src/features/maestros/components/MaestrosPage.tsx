'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ObrasTab } from './ObrasTab'
import { MaterialesTab } from './MaterialesTab'
import { AliasTab } from './AliasTab'

export function MaestrosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Maestros</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión de obras, materiales y alias de búsqueda
        </p>
      </div>

      <Tabs defaultValue="obras">
        <TabsList>
          <TabsTrigger value="obras">Obras</TabsTrigger>
          <TabsTrigger value="materiales">Materiales</TabsTrigger>
          <TabsTrigger value="alias">Alias</TabsTrigger>
        </TabsList>

        <TabsContent value="obras">
          <ObrasTab />
        </TabsContent>

        <TabsContent value="materiales">
          <MaterialesTab />
        </TabsContent>

        <TabsContent value="alias">
          <AliasTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
