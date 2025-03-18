/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDomain, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { Result } from "@/domains/result/index";

export enum Events {
  Tip,
  Error,
  Login,
  Logout,
  /** 身份凭证失效 */
  Expired,
  NeedUpdate,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Tip]: string[];
  [Events.Error]: Error;
  [Events.Login]: UserState & { token: string };
  [Events.Logout]: void;
  [Events.Expired]: void;
  [Events.NeedUpdate]: void;
  [Events.StateChange]: UserState;
};
type UserProps = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  token: string;
};
type UserState = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  token: string;
};
export class UserCore extends BaseDomain<TheTypesOfEvents> {
  static Events = Events;

  _unique_id = "UserCore";
  debug = false;

  id: string = "";
  username: string = "Anonymous";
  email: string = "";
  avatar: string = "";
  token: string = "";
  isLogin: boolean = false;
  permissions: string[] = [];
  services: { auth?: RequestCore<any> } = {};

  get state(): UserState {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      token: this.token,
    };
  }
  constructor(props: Partial<{ unique_id: string }> & UserProps) {
    super(props);

    const { id, username, email, avatar, token } = props;
    // this.log("constructor", initialUser);
    this.id = id;
    this.username = username;
    this.email = email;
    this.avatar = avatar;
    this.isLogin = !!token;
    this.token = token;
  }
  setServices(services: { auth: RequestCore<any> }) {
    this.services = services;
  }
  async authWithToken(token: string) {
    //     const { id, email, token } = values;
    //     if (!token) {
    //       return Result.Err("缺少 token");
    //     }
    //     this.id = id;
    //     this.email = email;
    if (!this.services.auth) {
      return Result.Err("请传入 services.auto");
    }
    const r = await this.services.auth.run(token);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    this.token = token;
    this.isLogin = true;
    this.emit(Events.Login, { ...this.state });
    return Result.Ok({
      //       id,
      token,
    });
  }
  hasPermission(key: string) {
    return this.permissions.includes(key);
  }
  logout() {
    this.username = "Anonymous";
    this.email = "";
    this.avatar = "";
    this.isLogin = false;
    this.token = "";
    this.emit(Events.Logout);
  }

  onLogin(handler: Handler<TheTypesOfEvents[Events.Login]>) {
    return this.on(Events.Login, handler);
  }
  onLogout(handler: Handler<TheTypesOfEvents[Events.Logout]>) {
    return this.on(Events.Logout, handler);
  }
  onNeedUpdate(handler: Handler<TheTypesOfEvents[Events.NeedUpdate]>) {
    return this.on(Events.NeedUpdate, handler);
  }
  onExpired(handler: Handler<TheTypesOfEvents[Events.Expired]>) {
    return this.on(Events.Expired, handler);
  }
}
