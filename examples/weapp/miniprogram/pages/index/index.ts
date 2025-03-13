import { Form } from '@/index'

Page({
  data: {
    value: ''
  },
  
  onLoad() {
    const form = new Form({
      onChange: (value: string) => {
        this.setData({ value })
      }
    })
  }
}) 