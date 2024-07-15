"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ExpandIcon,
  EyeIcon,
  InfoIcon,
  LayoutGridIcon,
  MinusIcon,
  PlusIcon,
  Printer,
  ToyBrick,
  UndoIcon,
  ImageDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { default as NextImage } from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ImageDisplayer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [mosaicImage, setMosaicImage] = useState<string | null>(null);
  const [piecesTable, setPiecesTable] = useState<{ [key: string]: any } | null>(
    null
  );
  const [instructions, setInstructions] = useState<string | null>(null);

  const [piecesCount, setPiecesCount] = useState<number>(0);
  const [panels, setPanels] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(400);
  const [loading, setLoading] = useState<boolean>(false);
  const [panelSize, setPanelSize] = useState<string>("32");

  const handleFileChange = (e: { target: { files: any[] } }) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImageToFirebase = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      throw new Error("No se ha seleccionado una imagen");
    }

    setLoading(true);

    if (loading) {
      toast.error("Creando...");
    }

    try {
      const imageUrl = await uploadImageToFirebase(imageFile);
      setImageURL(imageUrl);
      const imageExt = imageFile.name.split(".").pop();

      const response = await fetch(
        `http://127.0.0.1:8000/upload?image_url=${encodeURIComponent(
          imageUrl
        )}&panels=${panels}&image_ext=${imageExt}&panel_size=${panelSize}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json(); // Parse JSON response

      toast.success("Imagen creada con éxito 🎉");

      setMosaicImage(`data:image/png;base64,${data.mosaic_image_base64}`);
      setPiecesTable(data.pieces_table);
      setInstructions(
        `data:image/png;base64,${data.instructions_image_base64}`
      );

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

  const handleZoomIn = () => {
    setZoom(zoom + 50);
  };

  const handleZoomOut = () => {
    setZoom(zoom - 50);
  };

  const handleUndo = () => {
    setImageFile(null);
    setMosaicImage(null);
    setPiecesTable(null);
    setPiecesCount(0);
    setImageURL(null);
    setPanels(1);
    setPanelSize("32");
    setZoom(400);
    setInstructions(null);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>LEGO Mosaic Printing</title>
          <style>
            /* Add custom styles for printing */
            body { font-family: Arial, sans-serif; }
            .print-header { text-align: center; margin-bottom: 20px; }
            .print-image { text-align: center; margin-bottom: 20px; }
            .print-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
            .print-table th { background-color: #f2f2f2; }
            .print-table caption { font-weight: bold; margin-bottom: 10px; }
            .print-instructions { text-align: center; margin-bottom: 20px; }
            .print-instructions img { max-width: 100%; height: auto; }
            @media print {
              /* Adjust styles for printing */
              .print-table { width: 100%; margin-bottom: 20px; }
              .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
              .print-table th { background-color: #f2f2f2; }
              .print-table caption { font-weight: bold; margin-bottom: 10px; }
              .print-instructions { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>LEGO Creator - Mosaic Printing</h1>
          </div>
          <div class="print-image">
            <img src="${mosaicImage}" alt="LEGO Mosaic" style="width: 100%; max-height: 600px;">
          </div>
          <div class="print-table">
            <table>
              <caption>Piezas necesarias para armar la imagen</caption>
              <thead>
                <tr>
                  <th>Color</th>
                  <th>1 x 1</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(piecesTable || {})
                  .map(
                    ([color, pieces]) => `
                  <tr>
                    <td>${pieces["LEGO Brick Color"]}</td>
                    <td>${pieces["1 x 1"]}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr>
                  <td>Total</td>
                  <td>${piecesCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "Print", "height=800,width=1000");
    printWindow?.document.open();
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  // useEffect to clean up after printing
  useEffect(() => {
    return () => {
      // Ensure any opened print windows are closed on component unmount
      window.close();
    };
  }, []);

  console.log(panelSize);

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <header className="flex items-center justify-between h-16 px-4 border-b shrink-0 md:px-6">
        <div className="flex items-center gap-2">
          <NextImage src="/lego.png" alt="Lego Logo" width={40} height={40} />
          <h1 className="text-lg font-bold">Creator</h1>
        </div>
        <h2 className="text-sm font-medium">
          Ajustes de imagen para mosaicos de LEGO
        </h2>
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            disabled={!imageFile || loading}
            onClick={handleSubmit}
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleUndo} variant="outline">
            <UndoIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <section className="flex flex-1 p-4 md:p-10">
        <aside className="w-1/3 p-4 border-r">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Tamaño y Forma</h3>
            <p className="text-sm text-muted-foreground">Ajuste</p>
            <div className="flex items-center gap-3">
              <LayoutGridIcon className="w-6 h-6" />
              <span>
                Numero de piezas necesarias:{" "}
                <Badge className="ml-2">
                  {piecesCount.toLocaleString("en-US")}
                </Badge>
              </span>
              <InfoIcon className="w-4 h-4 ml-auto" />
            </div>
            <RadioGroup
              className="flex justify-start space-x-2"
              onValueChange={(value) => setPanelSize(value)}
              defaultValue={panelSize}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="32" id="32" />
                <Label htmlFor="32">32</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50" id="50" />
                <Label htmlFor="50">50</Label>
              </div>
            </RadioGroup>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Paneles de {panelSize}</span>
                <Input
                  type="number"
                  min={1}
                  max={35}
                  value={panels}
                  onChange={(e) => setPanels(Number(e.target.value))}
                  defaultValue={1}
                  className="w-16"
                />
              </div>
            </div>
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
          <div className="overflow-hidden">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="flex items-center justify-center w-full h-80">
                  {!mosaicImage && !loading ? (
                    <span className="text-sm text-muted-foreground">
                      Sube una imagen para comenzar
                    </span>
                  ) : loading ? (
                    <div className="flex items-center justify-center w-full h-80 flex-col gap-6">
                      <NextImage
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
                    <NextImage
                      src={mosaicImage ?? ""}
                      alt="Lego Mosaic"
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
                        disabled={!mosaicImage || !imageURL}
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
                      <NextImage
                        alt="Mosaico"
                        src={mosaicImage as string}
                        width={1000}
                        height={1000}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        disabled={!mosaicImage || !imageURL}
                        variant="outline"
                        size="icon"
                      >
                        <ToyBrick className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Piezas necesarias</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-y-auto">
                        <Table>
                          <TableCaption>
                            Piezas necesarias para armar la imagen
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Color</TableHead>
                              <TableHead>1 x 1</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {piecesTable &&
                              Object.entries(piecesTable).map(
                                ([color, pieces]) => (
                                  <TableRow key={color}>
                                    <TableCell>
                                      {pieces["LEGO Brick Color"]}
                                    </TableCell>
                                    <TableCell>{pieces["1 x 1"]}</TableCell>
                                  </TableRow>
                                )
                              )}
                            <TableRow className="bg-[#f2f2f2]">
                              <TableCell>Total</TableCell>
                              <TableCell>{piecesCount}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        disabled={!instructions}
                        variant="outline"
                        size="icon"
                      >
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[1920px]">
                      <DialogHeader>
                        <DialogTitle>¡Instrucciones de armado!</DialogTitle>
                      </DialogHeader>
                      <NextImage
                        alt="Instrucciones"
                        src={instructions as string}
                        width={1000}
                        height={1000}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    disabled={!mosaicImage || !imageURL}
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = mosaicImage as string;
                      a.download = "lego-mosaic.png";
                      a.click();
                    }}
                  >
                    <ImageDown className="w-4 h-4" />
                  </Button>
                  <Button
                    disabled={!instructions}
                    variant="outline"
                    size="icon"
                    onClick={handlePrint}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
