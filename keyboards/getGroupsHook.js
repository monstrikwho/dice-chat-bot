const groupsHook = (ctx) => {
  if (ctx.session.state.specialty === "АТП" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:АТМз61)/, 'atp'];
  }
  if (ctx.session.state.specialty === "А" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:Ас11|Ас21|Ас31|Азс11|Азс21|Азс31|Азс41)/, 'a'];
  }
  if (ctx.session.state.specialty === "ИТвМ" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:ИТвМмз11)/, 'itvm'];
  }
  if (ctx.session.state.specialty === "ИСТ" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:ИСТ11|ИСТ12|ИСТ21|ИСТ22|ИСТ31|ИСТ41|ИСТзс11|ИСТзс21|ИСТзс31|ИСТзс41)/, 'ist'];
  }
  if (ctx.session.state.specialty === "МиМ" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:МИМмз21)/, 'mim'];
  }
  if (ctx.session.state.specialty === "ПИТТ" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:ПИТТ11)/, 'pitt'];
  }
  if (ctx.session.state.specialty === "ТОСП" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:ТОСП11|ТОСП21|ТОСП31|ТОСП41|ТОСПзс11|ТОСПзс21|ТОСПзс31|ТОСПзс41|ТОСПс11|ТОСПс21|ТОСПс31)/, 'tosp'];
  }
  if (ctx.session.state.specialty === "ТО" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:ТО41|ТО51)/, 'to'];
  }
  if (ctx.session.state.specialty === "ТМ" && ctx.session.state.faculty === 'ИФ') {
    return [/(?:ТМ11|ТМ21|ТМ31|ТМ41|ТМ51|ТМз61|ТМзс11|ТМзс21)/, 'tm'];
  }
  if (ctx.session.state.specialty === "ГЭ" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ГЭ11|ГЭ21|ГЭ31|ГЭ41)/, 'ge'];
  }
  if (ctx.session.state.specialty === "ДО" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ДО11|ДО21|ДО31|ДО41|ДОз11|ДОз21|ДОз31|ДОз41|ДОз51|ДОзс11|ДОзс21|ДОзс31|ДОзсд11)/, 'do'];
  }
  if (ctx.session.state.specialty === "НО" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:НО11|НО21|НО31|НО41|НОзс31)/, 'no'];
  }
  if (ctx.session.state.specialty === "ОТИ" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ОТИ11|ОТИ21|ОТИ31|ОТИ41)/, 'oti'];
  }
  if (ctx.session.state.specialty === "ОП" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ОПмз21)/, 'op'];
  }
  if (ctx.session.state.specialty === "ПП" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ПП11|ПП21|ПП31|ПП41|ППз11|ППз21|ППз31|ППз41|ППз51)/, 'pp'];
  }
  if (ctx.session.state.specialty === "СП" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:СП11|СП21|СП31|СП41)/, 'sp'];
  }
  if (ctx.session.state.specialty === "СПД" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:СПД11|СПД21)/, 'spd'];
  }
  if (ctx.session.state.specialty === "ТиМОВ" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ТиМОВм11|ТиМОВмз11|ТМОВ11)/, 'timov'];
  }
  if (ctx.session.state.specialty === "ФК" && ctx.session.state.faculty === 'ФПиП') {
    return [/(?:ФК11|ФК21|ФК31|ФК41)/, 'fk'];
  }
  if (ctx.session.state.specialty === "БУ" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:БУд218)/, 'by'];
  }
  if (ctx.session.state.specialty === "ДО" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:ДОд218|ДОз118|ДОз217|ДОз219)/, 'i_do'];
  }
  if (ctx.session.state.specialty === "ПД" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:ПД118|ПДз119)/, 'pd'];
  }
  if (ctx.session.state.specialty === "ПР" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:ПРд118|ПРд119|ПРд120|ПРд219|ПРз218|ПРз219)/, 'pr'];
  }
  if (ctx.session.state.specialty === "ПП" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:ППз218|ППз219)/, 'i_pp'];
  }
  if (ctx.session.state.specialty === "ПО" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:ПОз118|ПОз219)/, 'po'];
  }
  if (ctx.session.state.specialty === "ЭиУПП" && ctx.session.state.faculty === 'ИПКиП') {
    return [/(?:Эд218|Эд219)/, 'eiynpp'];
  }
  if (ctx.session.state.specialty === "Б" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:Б31|Б41)/, 'b'];
  }
  if (ctx.session.state.specialty === "БА" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:БА11|БА21|БА31|БА41|БАздс11|БАздс21|БАздс31|БАзс11|БАзс21|БАзс31)/, 'ba'];
  }
  if (ctx.session.state.specialty === "М" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:М41|Мзд41|Мздс11|Мздс21|Мздс31|Мзс11|Мзс21|Мзс31)/, 'm'];
  }
  if (ctx.session.state.specialty === "ПХ" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:ПХ11|ПХ21|ПХ22|ПХ31|ПХ31|ПХ41|ПХ42|ПХз11|ПХз21|ПХз22|ПХз31|ПХз32|ПХз41|ПХз51|ПХздс31|ПХзс11|ПХзс21|ПХзс31)/, 'ph'];
  }
  if (ctx.session.state.specialty === "ЭОП" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:ЭОП31|ЭОП41|ЭОП51|ЭОПз61|ЭОПзс31|ЭОПзс41)/, 'eop'];
  }
  if (ctx.session.state.specialty === "ЭТ" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:ЭТ41)/, 'et'];
  }
  if (ctx.session.state.specialty === "ЭП" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:ЭП11|ЭП21|ЭП31|ЭП41)/, 'ep'];
  }
  if (ctx.session.state.specialty === "ЭМ" && ctx.session.state.faculty === 'ФЭП') {
    return [/(?:ЭМ11|ЭМ21|ЭМ31|ЭМ41)/, 'em'];
  }
  if (ctx.session.state.specialty === "БИЯ" && ctx.session.state.faculty === 'ФСиГЯ') {
    return [/(?:БИЯ11|БИЯ21|БИЯ31|БИЯ41)/, 'biya'];
  }
  if (ctx.session.state.specialty === "ИЯ" && ctx.session.state.faculty === 'ФСиГЯ') {
    return [/(?:ИЯ11|ИЯ21|ИЯ22|ИЯ31|ИЯ32|ИЯ41|ИЯ42)/, 'iya'];
  }
  if (ctx.session.state.specialty === "НА" && ctx.session.state.faculty === 'ФСиГЯ') {
    return [/(?:НА11|НА21|НА31)/, 'na'];
  }
  if (ctx.session.state.specialty === "РИЯ" && ctx.session.state.faculty === 'ФСиГЯ') {
    return [/(?:РИЯ11)/, 'riya'];
  }
  if (ctx.session.state.specialty === "СИЯ" && ctx.session.state.faculty === 'ФСиГЯ') {
    return [/(?:СИЯ11|СИЯ12|СИЯ13|СИЯ21|СИЯ22|СИЯ23|СИЯ31|СИЯ32|СИЯ33|СИЯ41|СИЯ42|СИЯ43)/, 'siya'];
  }
};

module.exports = groupsHook;
