package backStudX.Configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;
import org.springframework.context.annotation.Bean;

@Configuration
public class WebSocketConfig {

    // Este bean permite que el servidor soporte WebSockets
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
