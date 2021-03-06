<?php
/**
 * @name eolinker open source，eolinker开源版本
 * @link https://www.eolinker.com
 * @package eolinker
 * @author www.eolinker.com 深圳波纹聚联网络科技有限公司 ©2015-2016

 *  * eolinker，业内领先的Api接口管理及测试平台，为您提供最专业便捷的在线接口管理、测试、维护以及各类性能测试方案，帮助您高效开发、安全协作。
 * 如在使用的过程中有任何问题，欢迎加入用户讨论群进行反馈，我们将会以最快的速度，最好的服务态度为您解决问题。
 * 用户讨论QQ群：284421832
 *
 * 注意！eolinker开源版本仅供用户下载试用、学习和交流，禁止“一切公开使用于商业用途”或者“以eolinker开源版本为基础而开发的二次版本”在互联网上流通。
 * 注意！一经发现，我们将立刻启用法律程序进行维权。
 * 再次感谢您的使用，希望我们能够共同维护国内的互联网开源文明和正常商业秩序。
 *
 */
class TestHistoryModule
{
	public function __construct()
	{
		@session_start();
	}

	/**
	 * 添加测试记录
	 * @param $apiID 接口ID
	 * @param $requestInfo 测试请求信息
	 * @param $resultInfo 测试结果信息
	 * @param $testTime 测试时间
	 */
	public function addTestHistory(&$apiID, &$requestInfo, &$resultInfo, &$testTime)
	{
		//判断返回结果是否为空
		if (empty($resultInfo))
		{
			$resultInfo = '';
		}

		$projectDao = new ProjectDao;
		$apiDao = new ApiDao;
		$testHistoryDao = new TestHistoryDao;

		if ($projectID = $apiDao -> checkApiPermission($apiID, $_SESSION['userID']))
		{
			$projectDao -> updateProjectUpdateTime($projectID);
			return $testHistoryDao -> addTestHistory($projectID, $apiID, $requestInfo, $resultInfo, $testTime);
		}
		else
			return FALSE;
	}

	/**
	 * 删除测试记录
	 * @param $testID 测试记录ID
	 */
	public function deleteTestHistory(&$testID)
	{
		$testHistoryDao = new TestHistoryDao;
		$projectDao = new ProjectDao;
		if ($projectID = $testHistoryDao -> checkTestHistoryPermission($testID, $_SESSION['userID']))
		{
			$projectDao -> updateProjectUpdateTime($projectID);
			return $testHistoryDao -> deleteTestHistory($testID);
		}
		else
			return FALSE;
	}

	/**
	 * 获取测试记录信息
	 * @param $testID 测试记录ID
	 */
	public function getTestHistory(&$testID)
	{
		$testHistoryDao = new TestHistoryDao;
		$projectDao = new ProjectDao;
		if ($projectID = $testHistoryDao -> checkTestHistoryPermission($testID, $_SESSION['userID']))
		{
			$projectDao -> updateProjectUpdateTime($projectID);
			return $testHistoryDao -> getTestHistory($testID);
		}
		else
			return FALSE;
	}

}
?>