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
  IconShield,
  IconLock,
  IconFileText,
  IconMail,
  IconCheck,
} from "@/components/icons";

export function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Información detallada sobre el tratamiento de datos personales de acuerdo con el Reglamento General de Protección de Datos (RGPD UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD).
          </p>
        </div>

        {/* 1. Responsable del tratamiento */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">1. Responsable del Tratamiento</CardTitle>
              <p className="text-xs text-muted-foreground">Identidad y datos del titular del servicio</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>
              El responsable del tratamiento de los datos recogidos a través de esta plataforma es el <strong className="text-foreground">Club Pádel Calatrava</strong> (entidad ficticia de demostración técnica):
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong className="text-foreground">Denominación:</strong> Club Deportivo Elemental Pádel Calatrava</li>
              <li><strong className="text-foreground">NIF ficticio:</strong> G-13998877</li>
              <li><strong className="text-foreground">Domicilio:</strong> Avenida del Deporte 12, 13005 Ciudad Real, España</li>
              <li><strong className="text-foreground">Email de contacto:</strong> hola@padelreservas.es</li>
            </ul>
          </CardContent>
        </Card>

        {/* 2. Datos que se recogen */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconFileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">2. Datos Personales Recogidos</CardTitle>
              <p className="text-xs text-muted-foreground">Categorías de información tratada</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              Para prestar los servicios de gestión y reserva de pistas de pádel, recopilamos únicamente los datos necesarios y pertinentes:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1">
                <p className="font-medium text-foreground">Datos de Registro y Perfil</p>
                <p className="text-xs text-muted-foreground">
                  Nombre, apellidos, dirección de correo electrónico, número de teléfono de contacto y contraseña almacenada mediante hash unidireccional (BCrypt).
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1">
                <p className="font-medium text-foreground">Datos de Reservas e Historial</p>
                <p className="text-xs text-muted-foreground">
                  Identificador de pista, fecha, franja horaria reservada, código localizador, estado de la reserva y nombre o alias de los jugadores asociados.
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1">
                <p className="font-medium text-foreground">Datos de Conexión y Seguridad</p>
                <p className="text-xs text-muted-foreground">
                  Dirección IP de acceso para control de límites de tasa (rate limiting de seguridad anti-fuerza bruta) y registros de eventos de autenticación sensible.
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1">
                <p className="font-medium text-foreground">Imágenes y Contenido Multimedia</p>
                <p className="text-xs text-muted-foreground">
                  Fotografía de avatar personalizada proporcionada voluntariamente por el usuario para su perfil en la plataforma (almacenada en CDN seguro).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Base legal del tratamiento */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconLock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">3. Base Legal y Finalidad del Tratamiento</CardTitle>
              <p className="text-xs text-muted-foreground">Fundamento jurídico de conformidad con el art. 6 del RGPD</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <IconCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Ejecución del contrato / prestación del servicio (art. 6.1.b RGPD):</strong> Gestión integral de la cuenta de usuario, confirmación telemática de reservas, asignación de pistas y comunicación de avisos relacionados con las instalaciones.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <IconCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Interés legítimo en seguridad técnica (art. 6.1.f RGPD):</strong> Protección de la API frente a abusos, prevención de denegación de servicio (DoS) y registro de auditoría de accesos no autorizados.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <IconCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Consentimiento expreso del interesado (art. 6.1.a RGPD):</strong> Para la personalización voluntaria del avatar y la aceptación de almacenamiento de preferencias locales.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 4. Derechos del usuario */}
        <Card className="backdrop-blur-xl bg-card/60 border-white/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">4. Derechos del Usuario (ARCO+)</CardTitle>
              <p className="text-xs text-muted-foreground">Mecanismos para ejercer el control sobre tus datos personales</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              El usuario puede ejercer en cualquier momento sus derechos reconocidos en los artículos 15 a 22 del RGPD:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                <strong className="text-foreground block mb-0.5">Acceso</strong>
                Conocer qué datos personales suyos están siendo tratados y los detalles del tratamiento.
              </div>
              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                <strong className="text-foreground block mb-0.5">Rectificación</strong>
                Modificar sus datos inexactos o incompletos desde la sección de Perfil de la aplicación.
              </div>
              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                <strong className="text-foreground block mb-0.5">Supresión ("Derecho al olvido")</strong>
                Solicitar la eliminación de sus datos personales cuando ya no sean necesarios.
              </div>
              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                <strong className="text-foreground block mb-0.5">Portabilidad y Oposición</strong>
                Recibir sus datos en formato estructurado o bien oponerse al tratamiento por motivos legítimos.
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Para ejercer cualquiera de estos derechos, basta con enviar una solicitud a nuestro Delegado de Protección de Datos (DPO) indicando el derecho solicitado. También tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD, www.aepd.es).
            </p>
          </CardContent>
        </Card>

        {/* 5. Cookies y Contacto DPO */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="backdrop-blur-xl bg-card/60 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">5. Política de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground space-y-2">
              <p>
                Esta aplicación web únicamente utiliza <strong className="text-foreground">cookies técnicas y de sesión estrictamente necesarias</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-foreground">Cookie de refresco HttpOnly:</strong> Token seguro para mantener la sesión autenticada sin exposición en JavaScript.</li>
                <li><strong className="text-foreground">Almacenamiento local (localStorage):</strong> Clave <code className="text-primary font-mono">cookie_consent</code> para registrar la confirmación del aviso.</li>
              </ul>
              <p>
                No se utilizan cookies de seguimiento publicitario ni analítica invasiva de terceros.
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/60 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconMail className="h-4 w-4 text-primary" />
                6. Delegado de Protección de Datos (DPO)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground space-y-2">
              <p>
                Si tienes cualquier duda, solicitud o consulta sobre la privacidad o el tratamiento de tus datos en esta demo técnica, puedes dirigirte a nuestro Delegado de Protección de Datos ficticio:
              </p>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs space-y-1">
                <p><strong className="text-foreground">Oficina DPO:</strong> Club Pádel Calatrava</p>
                <p>
                  <strong className="text-foreground">Email: </strong>
                  <a href="mailto:dpo@padelreservas.es" className="text-primary hover:underline">
                    dpo@padelreservas.es
                  </a>
                </p>
                <p><strong className="text-foreground">Tiempo estimado de respuesta:</strong> 48-72 horas laborables</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
