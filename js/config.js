function getGlobalPath(name) {
  if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
  }
  var origin = window.location.origin;
  var url = origin;
  url = 'https://corpqa.tutormeet.com';
  switch (name) {
    case 'data':
      return url + '/data';
    case 'api':
      return url + '/tutormeetweb';
    case 'dashboard':
      return url + '/tutormeet';
    case 'upload':
      return url + '/tutormeetupload';
    case 'admin':
      return url + '/tutoradmin';
    case 'root':
      return url;
  }
  return null;
}