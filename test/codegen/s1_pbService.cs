
// AUTOGENERATED, DO NOT EDIT
// Type definitions for server implementations of ports.
// package: 
// file: s1.proto
using Google.Protobuf;
using rpc_csharp.server;
  
public abstract class BookService<Context>
{
  public string ServiceName = "BookService";

  public abstract Task<Book> GetBook(s1_pb.GetBookRequest request, Context context);
  public abstract IEnumerator<Task<s1_pb.Book>> QueryBooks(s1_pb.QueryBooksRequest request, Context context);


  public ServerModuleDefinition<Context> GetModuleDefinition()
  {
      var result = new ServerModuleDefinition<Context>();
      
      result.definition.Add("GetBook", async (payload, context) => { var res = await GetBook(s1_pb.GetBookRequest.Parser.ParseFrom(payload), context); return res.ToByteArray(); });
      result.streamDefinition.Add("QueryBooks", (payload, context) => { return QueryBooks(s1_pb.QueryBooksRequest.Parser.ParseFrom(payload), context); });

      return result;
  }

  private IEnumerator<Task<byte[]>> RegisterStreamFn<T>(IEnumerator<Task<T>> generator)
  where T : IMessage
  {
    using (var iterator = generator)
    {
      while (iterator.MoveNext())
      {
        var response = iterator.Current.Result.ToByteArray();
        yield return Task.FromResult(response);
      }
    }
  }
}
    