/**
 * Util
 */
export default class Util {
    public static checkSSL(head):boolean{
        if(head){
            /* Detect TLS from first bytes of data
            * used heuristic:
            * - an incoming connection using SSLv3/TLSv1 records should start with 0x16
            * - an incoming connection using SSLv2 records should start with the record size
            *   and as the first record should not be very big we can expect 0x80 or 0x00 (the MSB is a flag)
            * - everything else is considered to be unencrypted*/
             if (head[0] == 0x16 || head[0] == 0x80 || head[0] == 0x00) {
                 return true;
             }else{
                 return false;
             }
        }else{
            return false;
        }
    }
}
