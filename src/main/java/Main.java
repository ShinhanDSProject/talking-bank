import javax.sound.sampled.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class Main {

    // 네이버 Cloud에서 발급받은 값
    private static final String CLIENT_ID = "발급받은 ID";
    private static final String CLIENT_SECRET = "발급받은 Secret";

    public static void main(String[] args) {

        // 마이크 설정
        AudioFormat format = new AudioFormat(
                16000,  // 샘플링 레이트
                16,     // 16bit
                1,      // 모노
                true,   // signed
                false   // little endian
        );

        TargetDataLine microphone = null;

        try {
            microphone = AudioSystem.getTargetDataLine(format);
            microphone.open(format);
            microphone.start();

            System.out.println("음성 인식 테스트");
            System.out.println();
            System.out.println("음성 녹음 시작");
            System.out.println("5초 동안 아래의 예시 중 하나를 말씀해주세요.");
            System.out.println();
            System.out.println("[음성 명령 예시]");
            System.out.println("내 계좌 잔액 확인해줘");
            System.out.println("5만원 송금해줘");
            System.out.println("최근 거래내역 확인해줘");
            System.out.println("내 계좌 정보 확인해줘");

            // 음성 데이터를 메모리에 저장
            ByteArrayOutputStream pcmData =
                    new ByteArrayOutputStream();

            byte[] buffer = new byte[4096];

            long startTime = System.currentTimeMillis();

            // 5초 동안 녹음
            while (System.currentTimeMillis() - startTime < 5000) {

                int bytesRead =
                        microphone.read(
                                buffer,
                                0,
                                buffer.length
                        );

                if (bytesRead > 0) {
                    pcmData.write(
                            buffer,
                            0,
                            bytesRead
                    );
                }
            }

            microphone.stop();
            microphone.close();

            System.out.println();
            System.out.println("녹음 완료");
            System.out.println();
            System.out.println("음성 인식 중...");

            // PCM 데이터를 WAV 형식으로 변환
            byte[] pcmBytes = pcmData.toByteArray();

            byte[] wavBytes =
                    convertToWav(pcmBytes, format);

            // 네이버 STT 호출
            sendToNaver(wavBytes);

        } catch (Exception e) {

            e.printStackTrace();

            if (microphone != null) {
                microphone.close();
            }
        }
    }

    // PCM 데이터를 WAV 형식으로 변환
    private static byte[] convertToWav(
            byte[] pcmData,
            AudioFormat format
    ) throws Exception {

        ByteArrayInputStream pcmInput =
                new ByteArrayInputStream(pcmData);

        long frameLength =
                pcmData.length / format.getFrameSize();

        AudioInputStream audioInput =
                new AudioInputStream(
                        pcmInput,
                        format,
                        frameLength
                );

        ByteArrayOutputStream wavOutput =
                new ByteArrayOutputStream();

        AudioSystem.write(
                audioInput,
                AudioFileFormat.Type.WAVE,
                wavOutput
        );

        audioInput.close();

        return wavOutput.toByteArray();
    }

    // 네이버 STT API 호출
    private static void sendToNaver(
            byte[] wavData
    ) throws Exception {

        String apiURL =
                "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor";

        URL url = new URL(apiURL);

        HttpURLConnection conn =
                (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setDoInput(true);

        // 음성 데이터 형식
        conn.setRequestProperty(
                "Content-Type",
                "application/octet-stream"
        );

        // Client ID
        conn.setRequestProperty(
                "X-NCP-APIGW-API-KEY-ID",
                CLIENT_ID
        );

        // Client Secret
        conn.setRequestProperty(
                "X-NCP-APIGW-API-KEY",
                CLIENT_SECRET
        );

        // WAV 데이터 전송
        OutputStream outputStream =
                conn.getOutputStream();

        outputStream.write(wavData);
        outputStream.flush();
        outputStream.close();

        // 네이버 응답 읽기
        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                conn.getInputStream()
                        )
                );

        String line = reader.readLine();

        reader.close();
        conn.disconnect();

        // {"text":"인식된 내용"}에서 text만 추출
        String text = line
                .replace("{\"text\":\"", "")
                .replace("\"}", "");

        System.out.println();
        System.out.println("텍스트 인식 결과: " + text);

        // 은행 명령 분석
        if (text.contains("잔액")) {

            System.out.println("→ 현재 계좌에 50만원 있습니다.");

        } else if (text.contains("송금")) {

            System.out.println("→ 5만원이 송금되었습니다.");

        } else if (text.contains("거래내역")) {

            System.out.println("→ 거래내역이 조회되었습니다.");

        } else if (text.contains("계좌")) {

            System.out.println("→ 계좌 정보를 불러옵니다.");

        } else {

            System.out.println("→ 알 수 없는 명령입니다.");
        }
    }
}

