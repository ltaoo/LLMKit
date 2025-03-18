/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

import { useViewModel } from "@/hooks";

import { HomePageViewModel } from "./view-model";

export default function Home() {
  const [state, $model] = useViewModel(HomePageViewModel);

  return (
    <div className="w-screen h-screen">
      <div className="flex w-full">
        {/* 第一列 - 固定宽度 */}
        <div className="w-84 h-screen overflow-y-auto bg-gray-100 p-4 border-r">
          <h2 className="text-lg font-bold h-8 mb-4">LLM 提供商</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="llm_list w-full space-y-4">
              {state.providers &&
                state.providers.map((provider) => (
                  <div className="" key={provider.id}>
                    <div className="llm_header flex items-center justify-between">
                      <div className="llm_title flex items-center">
                        <img
                          className="w-5 h-5"
                          src={provider.logo_uri}
                          alt={provider.name}
                        />
                        <h2 className="text-lg font-medium text-gray-900">
                          {provider.name}
                        </h2>
                      </div>
                      <input
                        className="border"
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={(e) => {
                          $model.ui.$llm.toggleProviderEnabled({
                            provider_id: provider.id,
                            enabled: e.target.checked,
                          });
                        }}
                      />
                    </div>
                    <div>
                      {provider.enabled && (
                        <>
                          <div>
                            <div>
                              <div>API代理地址</div>
                              <input
                                className="w-full border"
                                placeholder={provider.placeholder}
                                value={provider.apiProxyAddress}
                                onChange={(event) => {
                                  $model.ui.$llm.updateProviderApiProxyAddress({
                                    provider_id: provider.id,
                                    apiProxyAddress: event.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <div>API密钥</div>
                              <input
                                className="w-full border"
                                value={provider.apiKey}
                                onChange={(event) => {
                                  $model.ui.$llm.updateProviderApiKey({
                                    provider_id: provider.id,
                                    apiKey: event.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                          {provider.models &&
                            provider.models.map((m) => (
                              <div
                                className="flex items-center justify-between gap-4"
                                key={m.id}
                              >
                                <div className="text-gray-900">{m.name}</div>
                                <div className="flex items-center">
                                  {!m.builtin && (
                                    <div
                                      className="text-sm mr-2 cursor-pointer whitespace-nowrap"
                                      onClick={() => {
                                        $model.ui.$llm.deleteProviderModel({
                                          provider_id: provider.id,
                                          model_id: m.id,
                                        });
                                      }}
                                    >
                                      删除
                                    </div>
                                  )}
                                  <input
                                    className="w-full border"
                                    type="checkbox"
                                    checked={m.enabled}
                                    onChange={(e) => {
                                      $model.ui.$llm.toggleModelEnabled({
                                        provider_id: provider.id,
                                        model_id: m.id,
                                        enabled: e.target.checked,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          <div className="flex items-center gap-4">
                            <input
                              className="flex-1 border"
                              autoComplete="off"
                              autoCapitalize="off"
                              value={
                                state.pendingProviders[provider.id]?.model_id ??
                                ""
                              }
                              onChange={(event) => {
                                $model.ui.$llm.updatePendingModel({
                                  provider_id: provider.id,
                                  id: event.target.value,
                                });
                              }}
                            />
                            <button
                              onClick={() => {
                                $model.ui.$llm.addPendingModel({
                                  provider_id: provider.id,
                                });
                              }}
                            >
                              新增model
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 聊天室 */}
        <div className="flex-1 h-screen overflow-y-auto p-4"></div>
      </div>
    </div>
  );
}
