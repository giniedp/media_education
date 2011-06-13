<?php
	require_once('inc.global.php');

  $debug = $_GET['debug'] == 'true';
  if(!$debug) {
    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');
    header('Access-Control-Allow-Origin: *');
  }

  $apicall = $_GET['func']?$_GET['func']:$_POST['func'];
  switch ($apicall) {
    case 'dictionary':
      $sim = trim($_GET['term']?$_GET['term']:$_POST['term']);
      if (strlen($sim) > 2) {
        $vocs = Array();
        foreach (Vocabulary::getSimilarVocabularies($sim) as $voc) {
          $x = $voc->getData();
          $x['label'] = $x['origin']." (".$x['language'].")";
          $vocs[] = $x;
        }

        echo json_encode($vocs);
      }
      break;
    
    case 'practice':
      $vocs = Array();
      $vocs['vocabulary'] = Array();
      $from = $_GET['from']?$_GET['from']:'de';
      $to = $_GET['to']?$_GET['to']:'en';
      $ordered = $_GET['ordered'] == '1';
      $realvocs = Vocabulary::getVocabularies($from, $to, !$ordered);
      if ($realvocs) {
        foreach ($realvocs as $voc) {
          $vocs['vocabulary'][] = $voc->getData();
        }
      }

      echo json_encode($vocs);
      break;
    
    default:
      print_r($_GET);
      break;
  
  }
  
  if ($debug)
    print_r(Log::getInstance()->getdebugMsg());
?>
