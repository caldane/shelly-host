export interface Webhooks {
    id: string
    src: string
    result: Result
    ip?: string
  }
  
  export interface Result {
    hooks: Hook[]
    rev: number
  }
  
  export interface Hook {
    id: number
    cid: number
    enable: boolean
    event: string
    name: string
    ssl_ca: string
    urls: string[]
    condition: any
    repeat_period: number
  }
  