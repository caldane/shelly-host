export interface MqttResponse {
    id: number
    src: string
    result: MqttResult
  }
  
  export interface MqttResult {
    enable: boolean
    server: string
    client_id: string
    user: any
    ssl_ca: any
    topic_prefix: string
    rpc_ntf: boolean
    status_ntf: boolean
    use_client_cert: boolean
    enable_rpc: boolean
    enable_control: boolean
    connected: boolean
  }
  