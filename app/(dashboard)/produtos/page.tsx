import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/services/auth.service";
import { listProducts } from "@/services/products.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProdutosPage() {
  await requireAdmin();
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground">Produtos e controle de quantidade.</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/produtos/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        ) : (
          products.map((product) => {
            const low = Number(product.quantity_on_hand) <= Number(product.min_quantity);
            return (
              <Link key={product.id} href={`/produtos/${product.id}`}>
                <Card className={low ? "border-destructive/40" : "transition-colors hover:border-gold/50"}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{product.name}</p>
                        {!product.active ? <Badge variant="destructive">Inativo</Badge> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.category ? `${product.category} · ` : ""}
                        {product.quantity_on_hand} {product.unit}
                      </p>
                    </div>
                    {low ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Baixo
                      </Badge>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
