import { motion } from "framer-motion";
import { fadeScale } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  IconFileText,
  IconClock,
  IconShield,
  IconMapPin,
  IconCheck,
} from "@/components/icons";

export function TerminosPage() {
  return (
    <div className="mx-auto max-w-4xl py-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeScale}
        className="space-y-6"
      >
        {/* Encabezado y Aviso de Demo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Badge variant="default" className="text-xs py-1 px-3">
              Proyecto de demostración educativa — los datos de contacto son ficticios
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Condiciones generales que regulan el acceso, navegación y reserva telemática de pistas en las instalaciones del Club Pádel Calatrava.
          </p>
        </div>

        {/* 1. Objeto del servicio */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconFileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">1. Objeto del Servicio</CardTitle>
              <p className="text-xs text-muted-foreground">Finalidad de la plataforma y ámbito de aplicación</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>
              Las presentes condiciones regulan la utilización del sistema web de reservas del <strong className="text-foreground">Club Pádel Calatrava</strong>. La plataforma permite a los usuarios registrados consultar la disponibilidad en tiempo real de las pistas deportivas, formalizar reservas por franjas horarias y gestionar sus reservas activas.
            </p>
            <p>
              El uso de esta plataforma implica la aceptación plena y sin reservas de cada una de las disposiciones incluidas en estos Términos y Condiciones.
            </p>
          </CardContent>
        </Card>

        {/* 2. Condiciones de cuenta y uso */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">2. Registro y Condiciones de Uso</CardTitle>
              <p className="text-xs text-muted-foreground">Obligaciones del usuario registrado</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span>
                  <strong className="text-foreground">Veracidad de los datos:</strong> El usuario se compromete a proporcionar información veraz, exacta y actualizada durante el registro (nombre, apellidos, teléfono y correo electrónico de contacto).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span>
                  <strong className="text-foreground">Custodia de credenciales:</strong> La contraseña es personal e intransferible. El usuario es el único responsable de la confidencialidad de sus claves de acceso y de cualquier actividad efectuada desde su cuenta.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span>
                  <strong className="text-foreground">Uso diligente:</strong> Queda terminantemente prohibido el uso automatizado, ataques de denegación de servicio, intentos de elusión del sistema de reservas o suplantación de identidad.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. Condiciones de reserva y política de cancelación */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconClock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">3. Reservas y Política de Cancelación</CardTitle>
              <p className="text-xs text-muted-foreground">Reglas operativas conforme a la política del club (Spec 020)</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <div className="space-y-2">
              <p>
                <strong className="text-foreground">Duración y asignación de pistas:</strong> Las reservas se realizan en franjas fijadas por la administración del club (60, 90 o 120 minutos según la disponibilidad configurada). La reserva otorga derecho exclusivo de uso de la pista seleccionada durante el tramo horario confirmado.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
                <p className="font-semibold text-primary text-sm flex items-center gap-2">
                  <IconClock className="h-4 w-4" />
                  Política de Cancelación con Antelación Mínima
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para permitir la reasignación de pistas a otros socios y garantizar la máxima disponibilidad de las instalaciones, toda cancelación debe realizarse con la <strong className="text-foreground">antelación mínima fijada por el club</strong> (por defecto 2 horas antes de la hora de inicio de la reserva). Pasado dicho plazo de corte, el sistema bloqueará la cancelación telemática ordinaria.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Si un jugador no comparece a su turno sin cancelación previa, el club se reserva el derecho de limitar temporalmente la posibilidad de efectuar nuevas reservas en periodos de alta demanda.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Normas de uso e instalaciones */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconMapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">4. Normas de Instalaciones y Responsabilidad</CardTitle>
              <p className="text-xs text-muted-foreground">Seguridad, calzado y causas meteorológicas</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2 text-xs sm:text-sm">
            <p>
              Los usuarios deberán portar vestimenta y calzado adecuado para pádel (suela de espiga/omni sin tacos que dañen el césped sintético). Se prohíbe el acceso con calzado de calle, vidrio o alimentos a las pistas.
            </p>
            <p>
              <strong className="text-foreground">Climatología adversa:</strong> En caso de lluvia o condiciones meteorológicas que impidan la práctica segura en pistas descubiertas, la reserva podrá ser reprogramada o cancelada por los administradores del club sin penalización.
            </p>
          </CardContent>
        </Card>

        {/* 5. Ley aplicable y fuero */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">5. Ley Aplicable y Jurisdicción</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>
              Las presentes Condiciones de Uso se rigen en todos y cada uno de sus extremos por la <strong className="text-foreground">legislación española</strong>.
            </p>
            <p>
              Para cualquier controversia derivada de la prestación del servicio o interpretación de estos términos, las partes se someten expresamente a los Juzgados y Tribunales de la ciudad de <strong className="text-foreground">Ciudad Real (España)</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles, sin perjuicio de los derechos que asisten a los usuarios que ostenten la condición de consumidores.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
