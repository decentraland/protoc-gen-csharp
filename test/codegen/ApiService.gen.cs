// AUTOGENERATED, DO NOT EDIT
// Type definitions for server implementations of ports.
// package: 
// file: api.proto
using System.Collections.Generic;
using System.Threading;
using Cysharp.Threading.Tasks;
using Google.Protobuf;
using rpc_csharp.protocol;
using rpc_csharp;

public abstract class BookService<Context>
{
  public const string ServiceName = "BookService";

  public delegate UniTask<Book> GetBook(GetBookRequest request, Context context, CancellationToken ct);

  public delegate IUniTaskAsyncEnumerable<Book> QueryBooks(QueryBooksRequest request, Context context);

  public delegate UniTask<Book> GetBookStream(GetBookRequest request, Context context, CancellationToken ct);

  public delegate IUniTaskAsyncEnumerable<Book> QueryBooksStream(GetBookRequest request, Context context);

  public static void RegisterService(RpcServerPort<Context> port, GetBook getBook, QueryBooks queryBooks, GetBookStream getBookStream, QueryBooksStream queryBooksStream)
  {
    var result = new ServerModuleDefinition<Context>();
      
    result.definition.Add("GetBook", async (payload, context, ct) => { var res = await getBook(GetBookRequest.Parser.ParseFrom(payload), context, ct); return res?.ToByteString(); });
    result.serverStreamDefinition.Add("QueryBooks", (payload, context) => { return ProtocolHelpers.SerializeMessageEnumerator<Book>(queryBooks(QueryBooksRequest.Parser.ParseFrom(payload), context)); });
result.clientStreamDefinition.Add("GetBookStream", async (IUniTaskAsyncEnumerable<ByteString> payload, Context context) => {
  return (await getBookStream(
    ProtocolHelpers.DeserializeMessageEnumerator<GetBookRequest>(payload, s => GetBookRequest.Parser.ParseFrom(s)), context))?.ToByteString();
});
result.bidirectionalStreamDefinition.Add("QueryBooksStream", (IUniTaskAsyncEnumerable<ByteString> payload, Context context) => {
  return ProtocolHelpers.SerializeMessageEnumerator<Book>(queryBooksStream(
    ProtocolHelpers.DeserializeMessageEnumerator<GetBookRequest>(payload, s => GetBookRequest.Parser.ParseFrom(s)), context));
});

    port.RegisterModule(ServiceName, (port) => UniTask.FromResult(result));
  }
}