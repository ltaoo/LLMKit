import { createSignal } from 'solid-js'
import { Form } from '@/index'

function App() {
  const [value, setValue] = createSignal('')

  return (
    <div>
      <h1>SolidJS Demo</h1>
      <Form onChange={setValue} />
      <p>Value: {value()}</p>
    </div>
  )
}

export default App 