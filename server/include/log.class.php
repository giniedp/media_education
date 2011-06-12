<?php

class Log {
	private $debug_msg = Array();
	private static $oInstance = null;

	static function getInstance() {
		if( !Log::$oInstance ) {
			Log::$oInstance = new Log();
		}
		if( !Log::$oInstance ) {
			Log::critical('Could not create Log singleton.');
		}			
		
		return Log::$oInstance;
		
	}
	
	function Log() {
	}

	public static function error($sMessage) {
		Log::showMessage("[E] ".$sMessage);
	}

	public static function warn($sMessage) {
		Log::showMessage("[W] ".$sMessage);
	}

	public static function critical($sMessage, $bDie = true) {
		Log::showMessage("[C] ".$sMessage);
		die('');
	}

	public static function debug($sMessage) {
		Log::getInstance()->debug_msg[] = $sMessage;
	}

	public function getDebugMsg() {
		return $this->debug_msg;
	}

	private static function showMessage($msg) {
		echo $msg."<br />\n";
	}
}
?>
