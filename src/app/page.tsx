import { ServiceWorkerRegister } from '@/components/webdroid/service-worker-register';
import { WebDroidPhone } from '@/components/webdroid/webdroid-phone';

export default function Home() {
  return (
    <>
      <ServiceWorkerRegister />
      <WebDroidPhone />
    </>
  );
}
