import { Button } from '@/components/ui/button'
import { login } from './actions'

export default function LoginPage() {
  return (
    <form>
      <Button variant="ghost"
        className="hover:bg-black hover:text-white"
        size="lg" formAction={login}
      >
        login
      </Button>
    </form>
  )
}