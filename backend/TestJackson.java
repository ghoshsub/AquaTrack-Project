public class TestJackson {
    public static void main(String[] args) {
        try {
            Class.forName("com.google.api.client.json.jackson2.JacksonFactory");
            System.out.println("JacksonFactory found");
        } catch (Exception e) {
            System.out.println("JacksonFactory not found");
        }
        try {
            Class.forName("com.google.gson.Gson");
            System.out.println("Gson found");
        } catch (Exception e) {
            System.out.println("Gson not found");
        }
    }
}
