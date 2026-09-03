import AuthGate from '@/components/AuthGate';
import OperationsApp from '@/components/OperationsApp';

export default function Page(){
  return <AuthGate><OperationsApp/></AuthGate>;
}
