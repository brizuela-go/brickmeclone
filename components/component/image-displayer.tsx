"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ExpandIcon,
  EyeIcon,
  InfoIcon,
  LayoutGridIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
  UndoIcon,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";

export function ImageDisplayer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mosaicImage, setMosaicImage] = useState<string | null>(null);
  const [piecesTable, setPiecesTable] = useState<{ [key: string]: any } | null>(
    null
  );
  const [piecesCount, setPiecesCount] = useState<number>(0);
  const [panelSize, setPanelSize] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(400);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: { target: { files: any[] } }) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      throw new Error("No se ha seleccionado una imagen");
    }

    setLoading(true);

    if (loading) {
      toast.error("Creando...");
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(imageFile);
    fileReader.onloadend = async () => {
      const base64String = (fileReader?.result as string)?.split(",")[1];

      setImageBase64(base64String);
      const fileExt = imageFile.type.split("/")[1];

      try {
        const response = await fetch(
          `http://localhost:8000/upload?image_base64=${encodeURIComponent(
            base64String
          )}&file_ext=${fileExt}&panel_size=${panelSize}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json(); // Parse JSON response

        toast.success("Imagen creada con éxito 🎉");

        setMosaicImage(`data:image/png;base64,${data.mosaic_image_base64[0]}`);
        setPiecesTable(data.pieces_table);
        setPiecesCount(
          Object.values(data.pieces_table).reduce(
            (acc: number, cur: any) => acc + cur["1 x 1"],
            0
          )
        );
      } catch (error) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
  };

  const handleZoomIn = () => {
    setZoom(zoom + 100);
  };

  const handleZoomOut = () => {
    setZoom(zoom - 100);
  };

  const handleUndo = () => {
    setImageFile(null);
    setMosaicImage(null);
    setPiecesTable(null);
    setPiecesCount(0);
    setImageBase64(null);
    setPanelSize(1);
  };

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <header className="flex items-center justify-between h-16 px-4 border-b shrink-0 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">LEGO Creator</h1>
        </div>
        <h2 className="text-sm font-medium">
          Ajustes de imagen para mosaicos de LEGO
        </h2>
        <div className="flex items-center gap-4">
          <Button variant="default" onClick={handleSubmit}>
            <EyeIcon className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button
            onClick={handleUndo}
            variant="ghost"
            className="bg-gray-700 text-white"
          >
            <UndoIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <section className="flex flex-1 p-4 md:p-10">
        <aside className="w-1/4 p-4 border-r">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Tamaño, Forma y Recorte</h3>
            <p className="text-sm text-muted-foreground">Ajuste</p>
            <div className="flex items-center gap-3">
              <LayoutGridIcon className="w-6 h-6" />
              <span>
                Numero de piezas: <Badge className="ml-2">{piecesCount}</Badge>
              </span>
              <InfoIcon className="w-4 h-4 ml-auto" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Paneles de 36</span>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={panelSize}
                  onChange={(e) => setPanelSize(Number(e.target.value))}
                  defaultValue={1}
                  className="w-16"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Zoom (Recorte)</span>
              <InfoIcon className="w-4 h-4 ml-auto" />
            </div>
            <Input
              type="range"
              min={0}
              max={100}
              defaultValue={100}
              className="w-full"
            />
          </div>
          <div className="mt-4">
            <Input
              type="file"
              placeholder="Subir imagen"
              accept=".png,.jpg,.jpeg"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFileChange(e as any)
              }
            />
          </div>
        </aside>
        <div className="flex-1 px-4 w-full bg-[#FBFDFA]">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Mosaico de Legos</CardTitle>
              <CardDescription className="flex items-center justify-center w-full h-80 ">
                {!mosaicImage || !imageBase64 ? (
                  <span className="text-sm text-muted-foreground">
                    Sube una imagen para comenzar
                  </span>
                ) : loading ? (
                  <div className="flex items-center justify-center w-full h-80 flex-col gap-6">
                    <Image
                      src={"/building.webp"}
                      width={300}
                      height={300}
                      alt="building"
                    />
                    <span className="text-sm text-muted-foreground">
                      Creando mosaico...
                    </span>
                  </div>
                ) : (
                  <Image
                    src={
                      mosaicImage
                        ? mosaicImage
                        : `data:image/png;base64,${imageBase64}`
                    }
                    alt="Lego Mosaic "
                    width={zoom}
                    height={zoom}
                  />
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!mosaicImage || !imageBase64}
                      variant="outline"
                      size="icon"
                    >
                      <ExpandIcon className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[1920px]">
                    <DialogHeader>
                      <DialogTitle>¡Tu imagen en LEGOS!</DialogTitle>
                    </DialogHeader>
                    <Image
                      alt="Mosaico"
                      src={mosaicImage as string}
                      width={1000}
                      height={1000}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
