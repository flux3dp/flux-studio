// hello.cc
#include <node.h>

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Float32Array;
using v8::ArrayBuffer;

struct Tri {
  float normal[3];
  float vertices[9];
  char bytecount[1];
} typedef Triangle;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}

void ParseStl(const FunctionCallbackInfo<Value>& args) {
  Local<ArrayBuffer> ab = Local<ArrayBuffer>::Cast(args[0]);
  int dataOffset = (int)(args[1]->NumberValue());
  int faces = (int)(args[2]->NumberValue());
  Local<Float32Array> vertices = Local<Float32Array>::Cast(args[3]);
  Local<Float32Array> normals = Local<Float32Array>::Cast(args[4]);

  char* dataPtr = ((char*)((ab->GetContents()).Data()) + dataOffset);

  float* verticesPtr = (float*)((vertices->Buffer()->GetContents()).Data());
  float* normalsPtr = (float*)((normals->Buffer()->GetContents()).Data());

  int offset = 0;

  for ( int face = 0; face < faces; face ++ ) {
    Triangle* ptr = (Triangle*)(dataPtr + face * 50);
    for ( int i = 0; i < 3; i ++ ) {
        verticesPtr[ offset ] = ptr->vertices[ i * 3 ];
        verticesPtr[ offset + 1 ] = ptr->vertices[ i * 3 + 1 ];
        verticesPtr[ offset + 2 ] = ptr->vertices[ i * 3 + 2 ];
        normalsPtr[ offset ] = ptr->normal[0];
        normalsPtr[ offset + 1 ] = ptr->normal[1];
        normalsPtr[ offset + 2 ] = ptr->normal[2];
        offset += 3;
    }
  }
    //   Local<Float32Array> f32 = Float32Array::New(ab, 0, args[1]->NumberValue());
        
    //   float* dataPtr = (float*)((f32->Buffer()->GetContents()).Data());

    //   for(size_t i = 0; i < f32->Length(); i++){
    //       dataPtr[i] = dataPtr[i]*2;
    //   }
    //   args.GetReturnValue().Set(f32);
}

void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
  NODE_SET_METHOD(exports, "parseStl", ParseStl);
}

NODE_MODULE(addon, init)

}  // namespace demo