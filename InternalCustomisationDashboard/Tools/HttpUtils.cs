using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;

namespace InternalCustomisationDashboard.Tools
{
    public class HttpUtils
    {
        public static string Get(string uri)
        {
            HttpClient client = new HttpClient();

            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using (HttpResponseMessage response = client.GetAsync(uri).Result)
            {
                if (!response.IsSuccessStatusCode)
                    throw new HttpRequestException(response.ReasonPhrase);
                using (HttpContent content = response.Content)
                {
                    return content.ReadAsStringAsync().Result;
                }
            }
        }

        public static string Post(List<KeyValuePair<string, string>> values, string uri)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));
                var content = new FormUrlEncodedContent(values);
                var result = client.PostAsync(uri, content).Result;
                return result.Content.ReadAsStringAsync().Result;
            }
        }

        public static string toUrl(List<string> values)
        {
            var result = "";

            foreach (var value in values)
            {
                if (result.Length > 0)
                    result += ",";
                result += value;
            }
            return result;
        }
    }
}