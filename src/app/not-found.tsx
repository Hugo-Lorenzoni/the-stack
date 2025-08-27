"use client";

import { Home, ArrowLeft } from "lucide-react";
import ImageComponent from "@/components/ImageComponent";
import Link from "@/components/Link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {/* 404 Hero Section */}
          <div className="relative mb-8">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl">
              <ImageComponent
                className="h-full w-full object-cover"
                src="/statue-houdain.jpg"
                width={4000}
                height={2667}
                alt="Statue de Houdain FPMs"
                quality="full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="drop-shadow-title text-8xl font-bold text-white">
                  404
                </h1>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="mb-4 text-3xl font-semibold text-gray-800">
              Page non trouvée
            </h2>
            <p className="mb-2 text-lg text-gray-600">
              Désolé, la page que vous recherchez n&apos;existe pas ou a été
              déplacée.
            </p>
            <p className="text-gray-500">
              Vérifiez l&apos;URL ou utilisez les liens ci-dessous pour
              naviguer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft size={20} />
              Page précédente
            </Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/">
                <Home size={20} />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
